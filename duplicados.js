const cvs = require('csv-parser')
const fs = require('fs');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

let dataOutput = [];
let dataEnrollmentFile = [];

const csvWriter = createCsvWriter({
    path: './ges/output/output-sin-duplicados.csv',
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

//enrollment file
let fileOutput = './ges/output/carnet4-outenrollment1.csv';
fs.createReadStream(fileOutput)
.pipe(cvs())
.on('data', (row) => {
    dataEnrollmentFile.push(row)
}).on('end', () => {
    let personasMap = dataEnrollmentFile.map(item=>{
        return [item.correo,item]
    });

    var personasMapArr = new Map(personasMap); // Pares de clave y valor

    let unicos = [...personasMapArr.values()];
    
    csvWriter
    .writeRecords(unicos)
    .then(()=> console.log("termino escribir"));
});

console.log(dataEnrollmentFile)