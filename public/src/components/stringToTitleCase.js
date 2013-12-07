// For convenience...
String.prototype.toTitleCase = function (str)
{
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}