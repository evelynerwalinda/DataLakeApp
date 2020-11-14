var api = require('./neo4jApi');
var pwd = require("../store-password.json")
var viz;
var typeRecherche = [];
$(function () {
  draw()
  draw2()

  var tagsinput = $('#tagsinput').tagsinput('items');

  $("#tagsinput").on('itemAdded', function (event) {
    console.log('item added : ' + event.item);
    console.log('tagsinput : ' + tagsinput)
    
    showProcesses(tagsinput)

    var query = "MATCH p=()-[r:hasTag]->(t :Tag) WHERE "
    for (var i = 0; i < tagsinput.length; i++) {
      if (i != tagsinput.length - 1) {
        query = query + "t.name = '" + tagsinput[i] + "' OR "
      }
      else {
        query = query + "t.name = '" + tagsinput[i] + "'"
      }
    }
    query = query + " RETURN p"

    console.log(query.length);
    console.log(query);
  });

  $('#names').on('click', "td", function() {
    console.log($(this).text());
    query = "MATCH path = (c:Process)<-[:sourceData]-(d:DLStructuredDataset) WHERE c.name='" + $(this).text() + "' RETURN path"; //Process
    // query = "MATCH path = shortestpath ((d:DLStructuredDataset)-[*]-(u:Study {name:'"+$(this).text()+"'})) RETURN path" //Study
    // query = "MATCH path = shortestpath ((ds:DatasetSource)-[*]-(d:DLStructuredDataset {name:'" + $(this).text()+"'})) RETURN path" //dataset
    console.log(query);
    if (query.length > 3) {
      viz.renderWithCypher(query);
    } else {
      console.log("reload");
      viz.reload();
    }
  });

  $('#filter :checkbox').change(function() {
    // this will contain a reference to the checkbox   
    if (this.checked) {
      console.log(this.id);
      typeRecherche.push(this.id);
      console.log(typeRecherche);
        // the checkbox is now checked 
    } else {
      console.log(this.id);
      const index = typeRecherche.indexOf(this.id);
      if (index > -1) {
        typeRecherche.splice(index, 1);
      }
      console.log(typeRecherche);
        // the checkbox is now no longer checked
    }
});


});




function showUser() {
  api
    .getUser()
    .then(user => {
      if (!user) return;
      console.log('user : ' + user.properties.lastName)
      $("#lastName").text(user.properties.lastName);
    }, "json");
}


function search() {
  var query = $("#search").find("input[name=search]").val();
  console.log("requete : " + query)
  api
    .getProcess(query)
    .then(p => {
      if (!p) return;
      showProcess(query)
    })
}



function showProcesses(tags) {
  api
    .getProcesses(tags)
    .then(p => {
      if (p) {
        var $list = $("#names").empty();
        for (var i = 0; i < p.length; i++) {

          $list.append($("<tr><td>" + p[i].name + "</td></tr>"));
        }
        console.log('nb items liste : ' + p.length)
      }
    }, "json");
}



function draw() {
  var config = {
    container_id: "viz",
    server_url: "bolt://localhost",
    server_user: "neo4j",
    server_password: pwd.password,
    labels: {
      "Troll": {
        caption: "user_key",
        size: "pagerank",
        community: "community"
      }
    },
    initial_cypher: "MATCH (n:User) WHERE n.lastName = 'SMITH' RETURN n"
  }

  viz = new NeoVis.default(config);
  viz.render();
}

function draw2() {
  var config = {
    container_id: "viz2",
    server_url: "bolt://localhost",
    server_user: "neo4j",
    server_password: pwd.password,
    labels: {
      "Troll": {
        caption: "user_key",
        size: "pagerank",
        community: "community"
      }
    },
    initial_cypher: "MATCH (n:User) WHERE n.lastName = 'Dupont' RETURN n"
  }

  viz2 = new NeoVis.default(config);
  viz2.render();
}

/*$(function () {
  renderGraph();
  search();

  $("#search").submit(e => {
    e.preventDefault();
    search();
  });
});

function showMovie(title) {
  api
    .getMovie(title)
    .then(movie => {
      if (!movie) return;

      $("#title").text(movie.title);
      $("#poster").attr("src","https://neo4j-documentation.github.io/developer-resources/language-guides/assets/posters/"+encodeURIComponent(movie.title)+".jpg");
      var $list = $("#crew").empty();
      movie.cast.forEach(cast => {
        $list.append($("<li>" + cast.name + " " + cast.job + (cast.job === "acted" ? " as " + cast.role : "") + "</li>"));
      });
    }, "json");
}

function search() {
  var query = $("#search").find("input[name=search]").val();
  api
    .searchMovies(query)
    .then(movies => {
      var t = $("table#results tbody").empty();

      if (movies) {
        movies.forEach(movie => {
          $("<tr><td class='movie'>" + movie.title + "</td><td>" + movie.released + "</td><td>" + movie.tagline + "</td></tr>").appendTo(t)
            .click(function() {
              showMovie($(this).find("td.movie").text());
            })
        });

        var first = movies[0];
        if (first) {
          showMovie(first.title);
        }
      }
    });
}

function renderGraph() {
  var width = 800, height = 800;
  var force = d3.layout.force()
    .charge(-200).linkDistance(30).size([width, height]);

  var svg = d3.select("#graph").append("svg")
    .attr("width", "100%").attr("height", "100%")
    .attr("pointer-events", "all");

  api
    .getGraph()
    .then(graph => {
      force.nodes(graph.nodes).links(graph.links).start();

      var link = svg.selectAll(".link")
        .data(graph.links).enter()
        .append("line").attr("class", "link");

      var node = svg.selectAll(".node")
        .data(graph.nodes).enter()
        .append("circle")
        .attr("class", d => {
          return "node " + d.label
        })
        .attr("r", 10)
        .call(force.drag);

      // html title attribute
      node.append("title")
        .text(d => {
          return d.title;
        });

      // force feed algo ticks
      force.on("tick", () => {
        link.attr("x1", d => {
          return d.source.x;
        }).attr("y1", d => {
          return d.source.y;
        }).attr("x2", d => {
          return d.target.x;
        }).attr("y2", d => {
          return d.target.y;
        });

        node.attr("cx", d => {
          return d.x;
        }).attr("cy", d => {
          return d.y;
        });
      });
    });
}*/