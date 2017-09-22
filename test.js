const extractor = require('./index');

extractor({
  start: '2017/1/1a'
}).on('message', function(e) {
  console.log(e.data);
});
