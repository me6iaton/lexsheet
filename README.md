# lexsheet

tool for import and export google sheet to lexicon.json

## install

```
npm install lexsheet -g
```

## Examples

```
lexsheet -h
lexsheet import ./lexicon.json XXX -a "test commit message"
lexsheet export ./lexicon.json XXX
```

## google sheet format

| namespace  	| key  	| description 	| en   	| ru   	| ...  |
|------------	|------	|-------------	|------	|------	|----- |
| namespace1 	| key1 	|             	| en 	  | ru 	  | ...  |
| namespace1 	| key2 	|             	| en 	  | ru 	  | ...  |
| namespace2 	| key1 	|             	| en 	  | ru 	  | ...	 |


## Lexicon format

```
{
  "en": {
    "namespace1": {
      "key1": "en translate",
      "key2": "en translate"
    },
    "namespace2": {
      "key1": "en translate"
    }
  },
  "ru": {
    "namespace1": {
      "key1": "ru translate",
      "key2": "ru translate"
    },
    "namespace2": {
      "key1": " ru translate"
    }
  }
}
```
