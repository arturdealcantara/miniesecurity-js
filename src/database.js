const mysql = require("mysql");
const geoip = require('geoip-lite');
// var fs = require('fs');

module.exports = {

  async introspect(user, password, host, database) {

//     var mysql = require("mysql");
    const connection = mysql.createConnection({
      host,
      user,
      password,
      database,
    });

    connection.connect();

    const findTables = await new Promise((resolve, reject) => {
        connection.query(
          "SHOW TABLES",
          (err, result) => {
            return err ? reject(err) : resolve(result);
          }
        );
      });

      let arrayOfTables = []
      for (const table of findTables ){
        
        const key = String(Object.keys(findTables[0]));
        
        arrayOfTables.push({
            name: table[key],
            columns: [],
          });

      }

      for (const findTables of arrayOfTables){

        const arrayOfColumns = findTables.columns
        
        const describeTables = await new Promise((resolve, reject) => {
          connection.query(
            `DESCRIBE ${findTables.name}`,
            (err, result) => {
              return err ? reject(err) : resolve(result);
            }
          );
        });

        for (const table of describeTables){

          arrayOfColumns.push({
            column : table.Field,
            type: table.Type,
            nullable: table.Null,
            Key:table.Key,
            default: table.Default,
            extra: table.Extra
          })
          
        }
        
      }

      connection.end();
      return arrayOfTables
      
    //   fs.writeFile ("input.json", JSON.stringify(arrayOfTables), function(err) {
    //     if (err) throw err;
    //     }
    // );

   
  },

  async monitoringUser(user, password, host, database, db_x,db_y) {

//     var mysql = require("mysql");
    const connection = mysql.createConnection({
      host,
      user,
      password,
      database,
    });

    connection.connect();

    const findUserLogged = await new Promise((resolve, reject) => {
        connection.query(
          "SHOW FULL PROCESSLIST",
          (err, result) => {
            return err ? reject(err) : resolve(result);
          }
        );
      });

      const response = []
      for (const user in findUserLogged){
        const host_complete = findUserLogged[user]['Host']
        const geoTracing = await geoip.lookup(host_complete.split(":")[0])
        const inject = {
          user : findUserLogged[user]['User'],
          host: host_complete,
          db: findUserLogged[user]['db'],
          command:findUserLogged[user]['Command'],
          state: findUserLogged[user]['State'],
          info: findUserLogged[user]['Info'],
          geoTracing
        }
        response.push(inject)
      }
      return response
  },

};
