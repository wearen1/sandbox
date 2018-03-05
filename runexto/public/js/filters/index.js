runexto
.filter('title', function(){
  return function(str){
    if (str && str.length > 33)
      return str.slice(0, 33) + '...';
    else
      return str;
  };
})
.filter('wikiUrl', function(){
  return function(str){
    if (str && str.length > 50)
      return str.slice(0, 50) + '...';
    else
      return str;
  };
});
