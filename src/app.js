var api = require('./neo4jApi');
var pwd = require("../store-password.json")
var viz;
var typeRecherche = [];
$(function () {
  draw()
  draw2()
  draw3()

  var tagsinput = $('#tagsinput').tagsinput('items');

  $("#tagsinput").on('itemAdded', function (event) {
    console.log('item added : ' + event.item);
    console.log('tagsinput : ' + tagsinput)
    $("#names").empty()
    draw()
    draw2()
    draw3()
    showProcesses(tagsinput)
    showStudies(tagsinput)
    showDatabases(tagsinput)
  });


  $("#tagsinput").on('itemRemoved', function (event) {
    console.log('item removed : ' + event.item);
    console.log('tagsinput : ' + tagsinput)

    if (!tagsinput.length == 0) {
      $("#names").empty()
      draw()
      draw2()
      draw3()
      showProcesses(tagsinput)
      showStudies(tagsinput)
      showDatabases(tagsinput)
    }
    else {
      $("#names").empty();
      draw()
      draw2()
      draw3()
    }
  });



  $('#names').on('click', "td", function () {
    $(".analyse").empty()
    
    console.log($(this));
    console.log($(this).context.className);
    $("#properties").empty()
    if($(this).context.className =="Process"){
      api
    .getProcesses([$(this).text()])
    .then(p => {
      if (p) {
        json = JSON.parse(JSON.stringify(p[0]))
        var $p = $("#properties")
        for(propriete in p[0]){
          if(propriete == 'creationDate' || propriete =="executionDate" || propriete=='id'){
            $p.append("<p>"+ propriete + " : "+ json[propriete].low + "</p>");
          }else {
            $p.append("<p>"+ propriete + " : "+ json[propriete] + "</p>");
          }
        }
      }
    }, "json");
      query = "MATCH path =(m : DLStructuredDataset)<-[:targetData]-(c:Process {name:'" + $(this).text() + "'})<-[:sourceData]-(d:DLStructuredDataset) OPTIONAL MATCH (c)<-[q:hasSubprocess]-(w: Process) RETURN path, w,q"; //Process
      query2 ="MATCH path= (p:Process {name:'" + $(this).text() + "'})-[:hasSubprocess]-(t:Process) RETURN path"
      query3 = "MATCH path = (p:Process {name:'" + $(this).text() + "'})-[:containsOp]->(c:OperationOfProcess)<-[:isUsedBy]-(o:Operation) RETURN path"
      if (query2.length > 3) {
        viz2.renderWithCypher(query2);
      } else {
        console.log("reload");
        viz2.reload();
      }
      if (query3.length > 3) {
        viz3.renderWithCypher(query3);
      } else {
        console.log("reload");
        viz3.reload();
      }
    }else {if($(this).context.className=="Study"){
      api
    .getStudies([$(this).text()])
    .then(p => {
      if (p) {
        json = JSON.parse(JSON.stringify(p[0]))
        var $p = $("#properties")
        for(propriete in p[0]){
          if(propriete == 'creationDate' || propriete =="executionDate" || propriete=='id'){
            $p.append("<p>"+ propriete + " : "+ json[propriete].low + "</p>");
          }else {
            $p.append("<p>"+ propriete + " : "+ json[propriete] + "</p>");
          }
        }
      }
    }, "json");
      query = "MATCH path = shortestpath ((d:DLStructuredDataset)-[*]-(u:Study {name:'"+$(this).text()+"'})) RETURN path" //Study
    
      var $list = $(this)
      api
      .getAnalyses(tagsinput)
      .then(p => {
        if (p) {
          
          $list.append($("<tr class ='analyse'><td>" + "Analyses :" + "</td></tr>"));
          for (var i = 0; i < p.length; i++) {
            $list.append($("<tr class ='analyse'><td>" + p[i].name + "</td></tr>"));
          }

        }
      }, "json");
    
    }else{if($(this).context.className=="Database"){
      api
    .getDatabases([$(this).text()])
    .then(p => {
      if (p) {
        console.log(p[0]);
        json = JSON.parse(JSON.stringify(p[0]))
        var $p = $("#properties")
        for(propriete in p[0]){
          
            $p.append("<p>"+ propriete + " : "+ json[propriete] + "</p>");
          }
        
      }
    }, "json");
      query = "MATCH path = shortestpath ((ds:DatasetSource)-[*]-(d:DLStructuredDataset {name:'" + $(this).text()+"'})) RETURN path"; //dataset
      //query2 = "MATCH path = (d:DLStructuredDataset {name:'" + $(this).text()+"'})-[:sourceData]->(p:Process), path2 = (d)<-[:targetData]-(p1:Process), (p1)-[:hasSubprocess]->(u:Process)  RETURN path,path2";
      //MATCH path = (d:DLStructuredDataset {name:'MIMIC critical care database'})-[:sourceData]->(p:Process), (p)-[:hasSubprocess]->(e:Process) OPTIONAL MATCH path2 = (d)<-[:targetData]-(p1:Process), (p1)-[:hasSubprocess]->(u:Process) RETURN path,path2
      query2 = "MATCH (d:DLStructuredDataset {name:'" + $(this).text()+"'}) OPTIONAL MATCH (d)-[r:sourceData]->(p:Process)-[:hasSubprocess]->(j:Process) OPTIONAL MATCH (d)<-[s:targetData]-(p1:Process)-[:hasSubprocess]->(j1:Process) with d,p,p1,r,s RETURN d,p,p1,r,s"
      if (query2.length > 3) {
        viz2.renderWithCypher(query2);
      } else {
        console.log("reload");
        viz2.reload();
      }
    }}}
    console.log(query);
    if (query.length > 3) {
      viz.renderWithCypher(query);
    } else {
      console.log("reload");
      viz.reload();
    }

  });

  $('#filter :checkbox').change(function () {
    // this will contain a reference to the checkbox   
    if (this.checked) {
      //console.log(this.id);
      typeRecherche.push(this.id);
      console.log("cases cochées : " + typeRecherche);
      $("#names").empty()
      for (var i = 0; i < typeRecherche.length; i++) {
        if (typeRecherche[i] == "process") {
          showProcesses(tagsinput)
        }

        if (typeRecherche[i] == "analysis") {
          showStudies(tagsinput)
        }

        if (typeRecherche[i] == "db") {
          showDatabases(tagsinput)
        }
      }
      // the checkbox is now checked 
    } else {
      console.log(this.id);
      const index = typeRecherche.indexOf(this.id);
      if (index > -1) {
        typeRecherche.splice(index, 1);
      }
      console.log(typeRecherche);
      // the checkbox is now no longer checked
      $("#names").empty()
      if (typeRecherche.length == 0) {
        console.log("pas de cases cochées")
        showProcesses(tagsinput)
        showStudies(tagsinput)
        showDatabases(tagsinput)
      }
      else {
        for (var i = 0; i < typeRecherche.length; i++) {
          if (typeRecherche[i] == "process") {
            showProcesses(tagsinput)
          }

          if (typeRecherche[i] == "analysis") {
            showStudies(tagsinput)
          }

          if (typeRecherche[i] == "db") {
            showDatabases(tagsinput)
          }
        }
      }
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
        //var $list = $("#names").empty();
        var $list = $("#names")
        for (var i = 0; i < p.length; i++) {

          $list.append($("<tr><td class='Process'>" + p[i].name + "</td></tr>"));
        }
        console.log('nb items liste : ' + p.length)
      }
    }, "json");
}

function showStudies(tags) {
  api
    .getStudies(tags)
    .then(p => {
      if (p) {
        //var $list = $("#names").empty();
        var $list = $("#names")
        for (var i = 0; i < p.length; i++) {

          $list.append($("<tr><td class='Study'>" + p[i].name + "</td></tr>"));
        }
        console.log('nb items liste : ' + p.length)
      }
    }, "json");
}

function showDatabases(tags) {
  api
    .getDatabases(tags)
    .then(p => {
      if (p) {
        //var $list = $("#names").empty();
        var $list = $("#names")
        for (var i = 0; i < p.length; i++) {

          $list.append($("<tr><td class='Database'>" + p[i].name + "</td></tr>"));
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
      "Process": {
        caption: "name",
        font: {
          "size":26,
          "color":"#000000"
      },
      },

      "DLStructuredDataset": {
        caption: "name",
      },

      "sourceData": {
        caption: "name",
      },

      "AnalysisEntityClass": {
        caption: "name",
      },

      "DLStructuredDataset": {
        caption: "name",
      },
      "Study": {
        caption: "name",
      },
      "EntityClass":{
        caption: "name",
      }
    },
    arrows : true
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
      "Process": {
        caption: "name",
        font: {
          "size":26,
          "color":"#000000"
      },
      },

      "DLStructuredDataset": {
        caption: "name",
      },

      "sourceData": {
        caption: "name",
      },

      "AnalysisEntityClass": {
        caption: "name",
      },

      "DLStructuredDataset": {
        caption: "name",
      }
    },
    arrows : true
  }
  viz2 = new NeoVis.default(config);
  viz2.render();
}

  function draw3() {
    var config = {
      container_id: "viz3",
      server_url: "bolt://localhost",
      server_user: "neo4j",
      server_password: pwd.password,
      labels: {
        "Process": {
          caption: "name",
          font: {
            "size":26,
            "color":"#000000"
        },
        },
  
        "Operation": {
          caption: "name",
        },
  
        "OperationOfProcess": {
          caption: "nbOfSequence",
        }
      },
      arrows : true
    }
    viz3 = new NeoVis.default(config);
    viz3.render();
  }
  // var config = {
  //   container_id: "viz2",
  //   server_url: "bolt://localhost",
  //   server_user: "neo4j",
  //   server_password: pwd.password,
  //   labels: {
  //     "Troll": {
  //       caption: "user_key",
  //       size: "pagerank",
  //       community: "community"
  //     }
  //   },
  //   initial_cypher: "MATCH (n:User) WHERE n.lastName = 'Dupont' RETURN n"
  // }

  // viz2 = new NeoVis.default(config);
  // viz2.render();


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