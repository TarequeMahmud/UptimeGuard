//Dependencies
const fs = require('fs');
const path = require('path');

//Module Scuffholding 
const lib = {};

//Access the base folder
lib.basedir = path.join(__dirname, '/../.data/');

//write data to file

lib.create = (dir, file, data, callback) => {
    //open a file with given file, data and directory
    fs.open(`${lib.basedir+dir}/${file}.json`, 'wx', (err1, fileDescriptor)=>{
        //if file in the given name do not exists then create the file 
        if(!err1 && fileDescriptor){
            //stringify the given data
            const stringData = JSON.stringify(data)
            //Write the file
            fs.writeFile(fileDescriptor, stringData, (err2)=>{
                //If writes
                if(!err2){
                    //close the file
                    fs.close(fileDescriptor,(err3)=>{
                        //if closed
                        if(!err3){callback(false)}
                        //if could not close
                        else{callback('error closing file');}
                    })
                }else{
                    //If could not write
                    callback('error writing file');
                }
            });

        }else{
            //if file exists reject
            callback('Error creating file. The file may exist.')
        }
    });



};

//read data to the file
lib.read = (dir, file, callback)=>{
    fs.readFile(`${lib.basedir+dir}/${file}.json`, 'utf8',(err,data)=>{
        callback(err, data);
    });
}

//update data to the file

lib.update= (dir, file, data, callback) => {
    //open a file with given file, data and directory
    fs.open(`${lib.basedir+dir}/${file}.json`, 'r+', (err1, fileDescriptor)=>{
        //if file in the given name do not exists then create the file 
        if(!err1 && fileDescriptor){
            //stringify the given data
            const stringData = JSON.stringify(data)
            fs.ftruncate(fileDescriptor, (err)=>{
                if(!err){
                        //Write the file
                        fs.writeFile(fileDescriptor, stringData, (err2)=>{
                            //If writes
                            if(!err2){
                                //close the file
                                fs.close(fileDescriptor,(err3)=>{
                                    //if closed
                                    if(!err3){callback(false)}
                                    //if could not close
                                    else{callback('error closing file');}
                                })
                            }else{
                                //If could not write
                                callback('error writing file');
                            }
                        });
                }else{
                    callback('Error truncating file')
                }
            });

        }else{
            //if file exists reject
            callback('Error creating file. The file may exist.')
        }
    });



};

//delete data 
lib.delete =(dir, file, callback) =>{
    fs.unlink(`${lib.basedir+dir}/${file}.json`, (err)=>{
        if(!err){
            callback(false)
        }else{
            callback('error deleting file')
        }
    });

}
module.exports = lib;