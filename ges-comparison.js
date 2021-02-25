const cvs = require('csv-parser')
const fs = require('fs');
const path = require('path');

const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter = createCsvWriter({
  path: './ges/output/outenrollment1.csv',
  header: [
    {id: 'email', title: 'email'},
    {id: 'phone', title: 'phone'},
    {id: 'ccarrera', title: 'ccarrera'},
    {id: 'carrera', title: 'carrera'},
    {id: 'filename', title: 'filename'},
  ]
});

let dataOutput = [];
let dataEnrollmentFile = [];

let fileEnrollment = './ges/enrollment/Primer ingreso - FACTI 2021  - Listado.csv';

function filewalker(dir, done) {
    let results = [];

    fs.readdir(dir, function(err, list) {
        if (err) {
            return done(err);
        }
            

        var pending = list.length;

        if (!pending) {
            return done(null, results);
        }

        list.forEach(function(file){
            file = path.resolve(dir, file);

            fs.stat(file, function(err, stat){
                // If directory, execute a recursive call
                if (stat && stat.isDirectory()) {
                } else {
                    results.push(file);

                    //vamos a recorrer el dato de un archivo
                    fs.createReadStream(file)
                        .pipe(cvs())
                        .on('data', (row) => {
                            let interestedEmail = row['CORREO'];
                            let interestedPhone = row['TELÉFONO'];
                            let nameFile = path.basename(file)

                            let interestedInfo = {
                                email : interestedEmail,
                                phone : interestedPhone,
                                filename : nameFile,
                            }
                            
                            let found = dataEnrollmentFile.find(correo => correo.CORREO == interestedEmail)
                            if (found ) {
                                if (found.CORREO !== "" && interestedEmail !== "") {
                                    let foundI = dataOutput.find(correo => correo.email == interestedEmail)
                                    if (foundI) {
                                    } else {
                                        interestedInfo.ccarrera = found.CCARRERA,
                                        interestedInfo.carrera = found.CARRERA,
                                        dataOutput.push(interestedInfo);
                                    }
                                }
                            }
                        }).on('end', () => {
                            csvWriter
                            .writeRecords(dataOutput)
                            .then(()=> console.log(""));
                        })
                        
                    

                    if (!--pending) {
                        done(null, results);
                    }
                }
            });
        });
    });
};



//enrollment file
fs.createReadStream(fileEnrollment)
    .pipe(cvs())
    .on('data', (row) => {
        dataEnrollmentFile.push(row)
    }).on('end', () => {
        console.log("termina")
        filewalker("./ges/facti", function(err, data){
            if(err){
                throw err;
            }
            console.log(dataOutput)
            
        })
    });


