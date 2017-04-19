#! /usr/bin/env node
const fs = require('fs');
const https = require('https');
const packageJson = require('./package.json');
const parse = require('csv-parse');
const program = require('commander');

// extend commander
Object.getPrototypeOf(program).missingArgument = function(name) {
  console.error();
  console.error("  error: missing required argument `%s'", name);
  console.error();
  program.help();
  process.exit(1);
};

const parser = parse({delimiter: ','})

program
  .version(packageJson.version)

function writeLexicon(sheet, path) {
  const lexicon = {};
  const head = sheet.shift();
  const langs = head.slice(3);
  if (
    head[0] !== 'namespace' ||
    head[1] !== 'key' ||
    head[2] !== 'description'
  ) throw new Error(`wrong sheet format ${head}`)
  sheet.forEach(row => row.slice(3).forEach((cell, index) => {
    let lang = langs[index];
    let namespace = row[0];
    let key = row[1];
    if (!lexicon[lang]) lexicon[lang] = {};
    if (!lexicon[lang][namespace]) lexicon[lang][namespace] = {};
    lexicon[lang][namespace][key] = cell;
  }))
  fs.writeFile(path, JSON.stringify(lexicon, null, 2), (err) => {
    if (err) throw err;
  });
}

program
  .command('import <relative_path> <google_id>')
  .alias('i')
  .description('import <google_id> sheet and save lexicon to <relative_path>')
  .action(function(relative_path, google_id){
    const url = `https://docs.google.com/spreadsheets/d/${google_id}/export?format=csv`
    const sheet = []
    https.get(url, (res) => {
      res.pipe(parser)
        .on('data', (data) => {sheet.push(data)})
        .on('end', () => writeLexicon(sheet, relative_path))
        .on('error', (e) => {
          console.error("CSV parse error: " + e.message);
        });
    }).on('error', (e) => {
      console.error("Fetch error: " + e.message);
    });
  });

program
  .command('export <relative_path> <google_id>')
  .alias('e')
  .description('read lexicon from <relative_path> and export to <google_id> sheet')
  .option('-acp, --add_commit_push', 'export changes to remote repository')
  .action(function(relative_path, google_id){
    console.log('not work let');
  });


program.on('--help', function(){
  console.log('  Examples:');
  console.log('');
  console.log('    lexsheet import ./lexicon.json XXX');
  console.log('    lexsheet export -acp ./lexicon.json XXX');
  console.log('');
});

program.parse(process.argv);


if (program.args.length === 0) {
  // display usage
  program.help();
}
