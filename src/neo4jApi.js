require('file-loader?name=[name].[ext]!../node_modules/neo4j-driver/lib/browser/neo4j-web.min.js');
var Process = require('./models/Process');
var AnalysisEntityClass = require('./models/AnalysisEntityClass')
var DLStructuredDataset = require('./models/DLStructuredDataset')
var Study = require('./models/Study')
var _ = require('lodash');

var neo4j = window.neo4j.v1;
var pwd = require("../store-password.json")
var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", pwd.password));


function getUser() {
  var session = driver.session();
  console.log('début session')
  return session
    .run(
      "MATCH (n:User) WHERE n.lastName = $lastName RETURN n",
      { lastName: 'SMITH' })
    .then(result => {
      console.log('recuperation resultat requete')
      //console.log('results : ' + result.records[0].get('n'))
      return result.records[0].get('n')
    })
    .catch(error => {
      throw error;
    })
    .finally(() => {
      return session.close();
    });
}

function getProcess(query) {
  var session = driver.session();
  console.log('début session process')
  console.log(query)
  return session
    .run(
      "MATCH p=()-[r:hasTag]->(t :Tag {name: $name}) RETURN p",
      { name: query })
    .then(result => {
      return result.records.map(record => {
        return new Process(record.get('p').start);
      });
    })
    .catch(error => {
      throw error;
    })
    .finally(() => {
      return session.close();
    });
}

function getProcesses(tags) {
  var session = driver.session();
  console.log('début session recherches process')
  console.log('tags : ' + tags)
  var query = "MATCH (p:Process) OPTIONAL MATCH (p)-[r:hasTag]->(t :Tag) OPTIONAL MATCH (o:Operation)-[:isUsedBy]->(:OperationOfProcess)<-[:containsOp]-(p) WITH p,t,o WHERE "
  for(var i=0; i<tags.length; i++){
    if(i!=tags.length -1){
      query = query + "toLower(t.name) CONTAINS toLower('" + tags[i] + "') OR toLower(p.name) CONTAINS toLower('" + tags[i] + "') OR toLower(p.description) CONTAINS toLower('" + tags[i] + "') OR toLower(o.name) CONTAINS toLower('" + tags[i] + "') OR "
    }
    else{
      query = query + "toLower(t.name) CONTAINS toLower('" + tags[i] + "') OR toLower(p.name) CONTAINS toLower('" + tags[i] + "') OR toLower(p.description) CONTAINS toLower('" + tags[i] + "') OR toLower(o.name) CONTAINS toLower('" + tags[i] + "')"
    }
  }
  
  query = query + " RETURN distinct p"
  console.log('requete : ' + query)
  return session
    .run(
      query)
    .then(result => {
      return result.records.map(record => {
        return new Process(record.get('p'));
      });
    })
    .catch(error => {
      throw error;
    })
    .finally(() => {
      return session.close();
    });
}

function getStudies(tags) {
  var session = driver.session();
  console.log('début session recherche analyses')
  console.log('tags : ' + tags)
  var query = "MATCH (s:Study) WHERE "
  for(var i=0; i<tags.length; i++){
    if(i!=tags.length -1){
      query = query + "toLower(s.name) CONTAINS toLower('" + tags[i] + "') OR "
    }
    else{
      query = query + "toLower(s.name) CONTAINS toLower('" + tags[i] + "')"
    }
  }
  
  query = query + " RETURN s"
  console.log('requete : ' + query)
  return session
    .run(
      query)
    .then(result => {
      return result.records.map(record => {
        return new Study(record.get('s'))
      });
    })
    .catch(error => {
      throw error;
    })
    .finally(() => {
      return session.close();
    });
}

function getAnalyses(tags) {
  var session = driver.session();
  console.log('tags : ' + tags)
  var query = "MATCH (s:Study)-[r:hasAnalysis]->(a:AnalysisEntityClass) WHERE "
  for(var i=0; i<tags.length; i++){
    if(i!=tags.length -1){
      query = query + "toLower(s.name) CONTAINS toLower('" + tags[i] + "') OR "
    }
    else{
      query = query + "toLower(s.name) CONTAINS toLower('" + tags[i] + "')"
    }
  }
  
  query = query + " RETURN a"
  console.log('requete : ' + query)
  return session
    .run(
      query)
    .then(result => {
      return result.records.map(record => {
        return new Study(record.get('a'))
      });
    })
    .catch(error => {
      throw error;
    })
    .finally(() => {
      return session.close();
    });
}


function getDatabases(tags) {
  var session = driver.session();
  console.log('début session recherche bdd')
  console.log('tags : ' + tags)
  var query = "MATCH (ds:DLStructuredDataset) WHERE "
  for(var i=0; i<tags.length; i++){
    if(i!=tags.length -1){
      query = query + "toLower(ds.name) CONTAINS toLower('" + tags[i] + "') OR toLower(ds.description) CONTAINS toLower('" + tags[i] + "') OR "
    }
    else{
      query = query + "toLower(ds.name) CONTAINS toLower('" + tags[i] + "') OR toLower(ds.description) CONTAINS toLower('" + tags[i] + "')"
    }
  }
  
  query = query + " RETURN distinct ds"
  console.log('requete : ' + query)
  return session
    .run(
      query)
    .then(result => {
      return result.records.map(record => {
        return new DLStructuredDataset(record.get('ds'));
      });
    })
    .catch(error => {
      throw error;
    })
    .finally(() => {
      return session.close();
    });
}

exports.getUser = getUser;
exports.getProcess = getProcess;
exports.getProcesses = getProcesses;
exports.getStudies = getStudies;
exports.getAnalyses = getAnalyses;
exports.getDatabases = getDatabases;

/*function searchMovies(queryString) {
  var session = driver.session();
  return session
    .run(
      'MATCH (movie:Movie) \
      WHERE movie.title =~ $title \
      RETURN movie',
      {title: '(?i).*' + queryString + '.*'}
    )
    .then(result => {
      return result.records.map(record => {
        return new Movie(record.get('movie'));
      });
    })
    .catch(error => {
      throw error;
    })
    .finally(() => {
      return session.close();
    });
}

function getMovie(title) {
  var session = driver.session();
  return session
    .run(
      "MATCH (movie:Movie {title:$title}) \
      OPTIONAL MATCH (movie)<-[r]-(person:Person) \
      RETURN movie.title AS title, \
      collect([person.name, \
           head(split(toLower(type(r)), '_')), r.roles]) AS cast \
      LIMIT 1", {title})
    .then(result => {
      if (_.isEmpty(result.records))
        return null;

      var record = result.records[0];
      return new MovieCast(record.get('title'), record.get('cast'));
    })
    .catch(error => {
      throw error;
    })
    .finally(() => {
      return session.close();
    });
}

function getGraph() {
  var session = driver.session();
  return session.run(
    'MATCH (m:Movie)<-[:ACTED_IN]-(a:Person) \
    RETURN m.title AS movie, collect(a.name) AS cast \
    LIMIT $limit', {limit: neo4j.int(100)})
    .then(results => {
      var nodes = [], rels = [], i = 0;
      results.records.forEach(res => {
        nodes.push({title: res.get('movie'), label: 'movie'});
        var target = i;
        i++;

        res.get('cast').forEach(name => {
          var actor = {title: name, label: 'actor'};
          var source = _.findIndex(nodes, actor);
          if (source === -1) {
            nodes.push(actor);
            source = i;
            i++;
          }
          rels.push({source, target})
        })
      });

      return {nodes, links: rels};
    })
    .catch(error => {
      throw error;
    })
    .finally(() => {
      return session.close();
    });
}

exports.searchMovies = searchMovies;
exports.getMovie = getMovie;
exports.getGraph = getGraph;*/
