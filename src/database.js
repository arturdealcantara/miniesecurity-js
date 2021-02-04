let mysql = require("mysql");
var fs = require('fs');

module.exports = {

  async introspect(user, password, host, database) {

    var mysql = require("mysql");
    var connection = mysql.createConnection({
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

        console.log(findTables.name)

        for (const table of describeTables){

          arrayOfColumns.push({
            Column : table.Field,
            Type: table.Type,
            Nullable: table.Null,
            Key:table.Key,
            Default: table.Default,
            Extra: table.Extra
          })
          
        }
        
      }

      connection.end();

      fs.writeFile ("input.json", JSON.stringify(arrayOfTables), function(err) {
        if (err) throw err;
        console.log('complete');
        }
    );

   
  },
};
