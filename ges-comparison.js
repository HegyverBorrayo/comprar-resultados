const cvs = require('csv-parser')
const fs = require('fs');
const path = require('path');

const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter = createCsvWriter({
  path: './ges/output.csv',
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

let fileEnrollment = '/home/erehebo/Downloads/inscritos-2022.csv';

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
                    results.push(file);

                    filewalker(file, function(err, res){
                        results = results.concat(res);
                        if (!--pending) done(null, results);
                    });
                } else {
                    results.push(file);

                    //vamos a recorrer el dato de un archivo
                    fs.createReadStream(file)
                        .pipe(cvs())
                        .on('data', (row) => {
                            let interestedEmail = row['CORREO'];
                            interestedEmail = interestedEmail ? interestedEmail : row['Correo electrónico'];
                            interestedEmail = interestedEmail ? interestedEmail : row['Correo Personal'];
                            let interestedPhone = row['TELÉFONO'];
                            interestedPhone = interestedPhone ? interestedPhone : row['Número de teléfono'];
                            interestedPhone = interestedPhone ? interestedPhone : row['Teléfono'];
                            interestedPhone = interestedPhone ? interestedPhone : row['TELEFONO'];
                            let nameFile = path.basename(file)
                            if (!interestedEmail && !interestedPhone) {
                                console.log(`este no se pudo analizar: ${nameFile}`);
                                console.log(row)
                            }
                            
                            let found = dataEnrollmentFile.find(correo => ((correo.CORREO === interestedEmail) || (correo.TELEFONO == interestedPhone)) && correo.filename !== nameFile)
                            if (found ) {
                                if ((found.CORREO !== "" && interestedEmail !== "")) {
                                    let foundI = dataOutput.find(correoO => (correoO.email == interestedEmail) || (correoO.phone == interestedPhone) || (correoO.phone == interestedPhone && correoO.email == interestedEmail))

                                    if (foundI) {
                                        //console.log("lo encuentraaaaaaa")
                                    } else {
                                        //console.log(found.CORREO + "-----"+interestedEmail);
                                        //console.log(found)
                                        
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
        filewalker("/home/erehebo/Downloads/solicitantes", function(err, data){
            if(err){
                throw err;
            }
            console.log(dataOutput)
            
        })
    });


