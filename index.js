#! /usr/bin/env node
const fs = require('fs');
const https = require('https');
const packageJson = require('./package.json');
const parse = require('csv-parse');
const program = require('commander');
const git = require('simple-git')()

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

function createLexicon(sheet) {
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
  return JSON.stringify(lexicon, null, 2)
}

program
  .command('import <relative_path> <google_id>')
  .alias('i')
  .description('import <google_id> sheet and save lexicon to <relative_path>')
  .option('-a, --add_commit_push <message>', 'export changes to remote repository')
  .action(function(relative_path, google_id, options){
    const url = `https://docs.google.com/spreadsheets/d/${google_id}/export?format=csv`
    const sheet = []
    https.get(url, (res) => {
      res.pipe(parser)
        .on('data', (data) => {sheet.push(data)})
        .on('end', () => {
          fs.writeFile(relative_path, createLexicon(sheet), (err) => {
            if (err) throw err;
            if (options.add_commit_push) {
              git
               .add('./*')
               .commit(options.add_commit_push)
               .push('origin', 'master');
            }
          });
        })
        .on('error', (e) => {console.error("CSV parse error: " + e.message)});
    }).on('error', (e) => {console.error("Fetch error: " + e.message)});
  });

program
  .command('export <relative_path> <google_id>')
  .alias('e')
  .description('read lexicon from <relative_path> and export to <google_id> sheet')
  .action(function(relative_path, google_id){
    console.log('not work let');
  });


program.on('--help', function(){
  console.log('  Examples:');
  console.log('');
  console.log('    lexsheet import ./lexicon.json XXX -a "test commit message"');
  console.log('    lexsheet export ./lexicon.json XXX');
  console.log('');
});

program.parse(process.argv);


if (program.args.length === 0) {
  // display usage
  program.help();
}
