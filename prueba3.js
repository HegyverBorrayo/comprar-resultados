const cvs = require('csv-parser')
const fs = require('fs');
const path = require('path');

const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter = createCsvWriter({
  path: './output/eventos-repetidos.csv',
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
      {id: 'filename', title: 'filename'},
      {id: 'etiquetas', title: 'etiquetas'}
  ]
});

let dataOutput = [];
let dataEnrollmentFile = [];

let fileEnrollment = './inscritos/Datos inscritos nuevo ingreso 2023 - Alumnos primer ingreso.csv';

function filewalker(dir, done) {
    let results = [];

    fs.readdir(dir, function(err, list) {
        if (err) return done(err);
        let pending = list.length;

        if (!pending) return done(null, results);

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
                        const { "Nombres": name, "Nombres":_name, "Nombre": __name ,"Apellidos": lastname } = row;
                        const { "Número de teléfono": _phone, "TELÉFONO": __phone, "TELEFONO": ___phone, "Teléfono": ____phone } = row;
                        const { "CORREO": _email, "Correo Personal": __email, "Correo electrónico": ___email,} = row;
                        const { "Etiquetas": etiqueta } = row;
                        const nameFile = path.basename(file);

                        const extension = path.extname(file);
                        if (extension === ".csv") {
                            const infoUser = {
                                email: _email || __email || ___email,
                                nombres: name || _name || __name,
                                apellidos: lastname,
                                phone: _phone || __phone || ___phone || ____phone,
                                etiqueta: etiqueta,
                                filename : nameFile
                            }
                            
                            if (infoUser.nombres === "" && infoUser.email === "" ) {
                                console.log(`este no se pudo analizar: ${infoUser}`);
                            } else {
                                let found = dataEnrollmentFile.find(el => ((el.email === infoUser.email) || (el.phone == infoUser.phone)) && el.filename !== infoUser.filename)
                                if ( found ) {
                                    let foundI = dataOutput.find(el => (el.email == infoUser.email) || (el.phone == infoUser.phone) || (el.phone == infoUser.phone && el.email == infoUser.email))
                                    if (!foundI) {
                                        const { tipo, ccarrera, carrera, carnet, dpi, ges } = found;
                                        let interestedInfo = {
                                            tipo,
                                            ccarrera,
                                            carrera,
                                            carnet,
                                            dpi,
                                            ges,
                                            etiquetas: infoUser.etiqueta,
                                            telefono: infoUser.phone,
                                            correo: infoUser.email,
                                            ...infoUser
                                        }
                                        dataOutput.push(interestedInfo);
                                    }
                                }
                            }
                        }
                    }).on('end', () => {
                        csvWriter
                        .writeRecords(dataOutput)
                        .then(()=> {

                        });
                    })
                    if (!--pending)done(null, results);
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
}).on('end', async() => {
    const a = await filewalker("./interesados/Eventos", function(err, data){
        if(err){
            throw err;
        }
    });
    console.log(a)
});