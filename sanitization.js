module.exports = {
        Sanitize: function(str) {
        str = str.replace("'","");
        return str.trim();
    }
};