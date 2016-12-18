module.exports = function(req, res, next) {
  req.setLocale('cs') //req.session.languagePreference
  next()
}