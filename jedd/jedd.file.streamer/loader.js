var Promise = require('bluebird'),
    fs      = Promise.promisifyAll(require('fs')),
    _       = require('lodash'),
    colors  = require('colors')

var core = {}

var loadModules = function (core)
 {
  console.log('1. Building module tree...'.blue);
  var objModule_Tree = {}
  var intSection_Index = 0

  function loadSection (objModule_Tree, strSection_Name)
   {
    console.log(colors.blue('\t2.' + intSection_Index++ + ' Loading ' +  strSection_Name + ' section:'))

    return Promise.mapSeries
     (
      _.keys(objModule_Tree),
      function (strModule_Name)
       {
        core[strModule_Name] = core[strModule_Name] || {}
        if (objModule_Tree[strModule_Name][strSection_Name])
         {
          core[strModule_Name][strSection_Name] = core[strModule_Name][strSection_Name] || {}
          console.log(('\t\t- ' + strModule_Name + ':').black)

          return Promise.mapSeries
           (
            objModule_Tree[strModule_Name][strSection_Name],
            function (strFile_Name)
             {
              var strFile_Path = './module/' + strModule_Name + '/' + strSection_Name + '/' + strFile_Name
              console.log(colors.red('\t\t\t' + strFile_Path))

              return require(strFile_Path)(core)
             }
           )
         }
        else
         return null
       }
     )
   }

  return fs.readdirAsync('./module').then
   (
    function (arystrModule_Name)
     {
      return Promise.mapSeries
       (
        arystrModule_Name,
        function (strModule_Name)
         {
          objModule_Tree[strModule_Name] = {}

          return fs.readdirAsync('./module/' + strModule_Name + '/').then
           (
            function (arystrSubmodule_Name)
             {
              return Promise.mapSeries
               (
                arystrSubmodule_Name,
                function (strSubmodule_Name)
                 {
                  return fs.readdirAsync('./module/' + strModule_Name + '/' + strSubmodule_Name).then
                   (
                    function (aryStr_File_Name)
                     {
                      objModule_Tree[strModule_Name][strSubmodule_Name] = aryStr_File_Name
                     }
                   )
                 }
               )
             }
           )
         }
      );
     }
   )
  .then
   (
    function ()
     {
      console.log('2. Loading modules:'.blue)
      return Promise.mapSeries
       (
         [
          'initialize',
          'load',
          'controller',
          'route',
          'server'
         ],
        function (strSection_Name)
         {
          return loadSection(objModule_Tree, strSection_Name)
         }
       )
     }
   )
 };

console.log('0. Loading environment'.blue)
require('dotenv').load()

loadModules(core).then
 (
  function ()
   {
    console.log('Loading completed successfully'.blue)
   }
 )
