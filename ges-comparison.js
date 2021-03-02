const cvs = require('csv-parser')
const fs = require('fs');
const path = require('path');

const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter = createCsvWriter({
  path: './ges/output/carnet4-outenrollment1.csv',
  header: [
      {id: 'tipo', title: 'tipo'},
      {id: 'correo', title: 'correo'},
      {id: 'ges', title: 'ges'},
      {id: 'carnet', title: 'carnet'},
      {id: 'ccarrera', title: 'ccarrera'},
      {id: 'carrera', title: 'carrera'},
      {id: 'nombres', title: 'nombres'},
      {id: 'apellidos', title: 'apellidos'},
      {id: 'dpi', title: 'dpi'},
      {id: 'telefono', title: 'telefono'},
      {id: 'filename', title: 'filename'}
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

                            
                            let found = dataEnrollmentFile.find(correo => ((correo.CORREO === interestedEmail) || (correo.TELEFONO == interestedPhone)) && correo.filename !== nameFile)
                            if (found ) {
                                if ((found.CORREO !== "" && interestedEmail !== "")) {
                                    let foundI = dataOutput.find(correoO => (correoO.email == interestedEmail) || (correoO.phone == interestedPhone) || (correoO.phone == interestedPhone && correoO.email == interestedEmail))

                                    if (foundI) {
                                        console.log("lo encuentraaaaaaa")
                                    } else {
                                        //console.log(found.CORREO + "-----"+interestedEmail);
                                        
                                        let interestedInfo = {
                                            tipo : found.TIPO,
                                            ccarrera : found.CCARRERA,
                                            carrera : found.CARRERA,
                                            carnet : found.CARNET,
                                            nombres : found.NOMBRES,
                                            apellidos : found.APELLIDOS,
                                            dpi : found.DPI,
                                            correo : found.CORREO,
                                            ges : found.GES,
                                            telefono : found.TELEFONO,
                                            filename : nameFile
                                        }
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


