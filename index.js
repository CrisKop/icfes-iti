const dotenv = require('dotenv').config();
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const multer = require('multer');
const crypto = require('crypto');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const app = express();

// Configurar la sesión de Express
app.use(session({
  secret: process.env.session_pass,
  resave: false,
  saveUninitialized: false
}));

const path = require('path');

const storage = multer.diskStorage({
  destination: 'public/uploads/',
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const randomName = crypto.randomBytes(16).toString('hex');
    cb(null, randomName + ext);
  }
});

function findMissingNumber(arr) {
  return arr.reduce(function(prev, curr, index, array) {
    if (curr === index + array[0]) {
      return prev;
    } else {
      return index + array[0]++;
    }
  }, void 0);
}

const upload = multer({ storage: storage });

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static('public'))
app.use(cookieParser());

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));

// use res.render to load up an ejs view file

const mongodb = require(__dirname +"/database/database.js");
mongodb.then(() => {console.log("Mongodb Conectado") 
})


const questionsdb = require(__dirname +"/database/models/questions.js")
const cods = require(__dirname +"/database/models/cods.js")
const User = require(__dirname + "/database/models/users.js");
const Resp = require(__dirname + "/database/models/responses.js");
const Custom = require(__dirname + "/database/models/customtests.js");



// Inicializar Passport.js
app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
  clientID: process.env.ggl_client_id,
  clientSecret: process.env.ggl_client_secret,
  callbackURL: '/auth/google/callback'
},
async function(accessToken, refreshToken, profile, cb) {
  const user = {
    name: profile.displayName,
    email: profile.emails[0].value,
    rank: "user"
  };
  
  try {
    let existingUser = await User.findByEmail(user.email);
    if (existingUser) {
      return cb(null, existingUser);
    } else {
      let result = await User.create(user);
      return cb(null, result);
    }
  } catch (err) {
    return cb(err);
  }
})
);

passport.serializeUser((user, cb) => {
cb(null, user._id);
});

passport.deserializeUser(async (id, cb) => {
const user = await User.findById(id);
cb(null, user);
});

// Ruta para iniciar sesión con Google
app.get('/auth/google',
passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }),
function(req, res) {
  // Obtener la ruta de origen almacenada en la cookie o en la sesión del usuario
  const rutaOrigen = req.cookies.rutaOrigen || '/';

  // Verificar si el correo electrónico cumple con los criterios
  if (req.user.email.endsWith('@itilpn.edu.co')) {
    res.clearCookie('rutaOrigen'); // Limpiar la cookie de ruta de origen
    res.redirect(`${rutaOrigen}?l=1`);
  } else {
    res.redirect('/login?s=1');
  }
});

// Middleware para verificar si el usuario está autenticado
function isAuthenticated(req, res, next) {
if (req.isAuthenticated()) {
  return next();
} else {
  res.redirect('/login');
}
}

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}


// Rutas
app.get('/', async function(req, res) {
  let login = req.query.l ?? null;
  let respid = req.query.r ?? null;
  if(login === "1"){
  res.render('pages/index', { login: 1, respid: respid });
  } else if(login === "2"){
    res.render('pages/index', { login: 2, respid: respid });
  }
  
  else {
    res.render('pages/index', { login: null, respid: respid  });
  }
});


const findQuestions = async (data) => {
  const promises = data.resp.map((r) => {
    const div = r.split("-");
    const respondido = parseInt(div[1]) + 1;

    return questionsdb.findOne({mat: data.mat, type: 2, question: div[0]})
      .then((originalq) => {
        if (originalq.respuesta === respondido) {
          return `${div[0]}-${respondido}-c`;
        } else {
          return `${div[0]}-${respondido}-i`;
        }
      });
  });

  const results = await Promise.all(promises);
  return results;
};

app.get('/profile', isLoggedIn, async function(req, res) {

    Resp.find({email: req.user.email}, async function(err, data) {
      if (data) {

        console.log(data)

        let fullforms = data.filter(f => f.type === "full");
        let customforms = data.filter(f => f.type !== "full");

        console.log(fullforms)

        res.render('pages/profile', {user: req.user, fullforms: fullforms, customforms: customforms})
      }
    });
  
})

app.get('/results/:id', isLoggedIn, async function(req, res) {
  const codigobuscado = req.params.id;
  let rank = req.user.rank ?? null;
  if (rank && rank === "user") {
    Resp.findOne({id: codigobuscado, email: req.user.email}, async function(err, data) {
      if (data) {

        const checkedarray = await findQuestions(data);
        console.log("checkedarray: " + checkedarray);
        let matvar = {"ing":"Inglés","mat":"Matemáticas","lec":"Lectura Crítica","soc":"Ciencias Sociales","nat":"Ciencias Naturales"}
        res.render('pages/results', {resp: checkedarray, nombre: req.user.name, email: req.user.email, result: data.result, user: req.user, mat: matvar[data.mat],rank: rank, id: codigobuscado});
       } else {
        res.send("No encontrado")
      }
    });
  }

  else {
    Resp.findOne({id: codigobuscado}, async function(err, data) {
      if (data) {

        let nombre = User.findOne({email: data.email}, async function(err, data2){
     
       

        const checkedarray = await findQuestions(data);
        console.log("checkedarray: " + checkedarray);
        let matvar = {"ing":"Inglés","mat":"Matemáticas","lec":"Lectura Crítica","soc":"Ciencias Sociales","nat":"Ciencias Naturales"}
 res.render('pages/results', {resp: checkedarray, nombre: data2.name, email: data.email, result: data.result, user: req.user, mat: matvar[data.mat], rank: rank, id: codigobuscado});
})
      } else {
        res.send("No encontrado")
      }
    });
  }
});


app.post("/changerank", upload.none(), (req, res) => {
  const form = req.body;


    let usertoupdate = User.findOne({email: form.email}, function(err, found4){
      return found4; });

  usertoupdate.updateOne({ rank: form.rango})
  
  res.redirect("/admin/manageusers?u=1")
});




app.get('/ing', isLoggedIn, async function(req, res) {
  console.log(req.user.email)
  if(req.user && !req.user.email.endsWith("@itilpn.edu.co")){
    res.redirect('/login?s=1')
  }
  const questions = await questionsdb.find({ mat: 'ing' });
  res.render('pages/form', { user: req.user, questions: questions, mat: 'ing' });
});

app.get('/mat', isLoggedIn, async function(req, res) {
  console.log(req.user.email)
  if(req.user && !req.user.email.endsWith("@itilpn.edu.co")){
    res.redirect('/login?s=1')
  }
  const questions = await questionsdb.find({ mat: 'mat' });
  res.render('pages/form', { user: req.user, questions: questions, mat: 'mat' });
});

app.get('/lec', isLoggedIn, async function(req, res) {
  console.log(req.user.email)
  if(req.user && !req.user.email.endsWith("@itilpn.edu.co")){
    res.redirect('/login?s=1')
  }
  const questions = await questionsdb.find({ mat: 'lec' });
  res.render('pages/form', { user: req.user, questions: questions, mat: 'lec' });
});

app.get('/soc', isLoggedIn, async function(req, res) {
  console.log(req.user.email)
  if(req.user && !req.user.email.endsWith("@itilpn.edu.co")){
    res.redirect('/login?s=1')
  }
  const questions = await questionsdb.find({ mat: 'soc' });
  res.render('pages/form', { user: req.user, questions: questions, mat: 'soc' });
});

app.get('/nat', isLoggedIn, async function(req, res) {
  console.log(req.user.email)
  if(req.user && !req.user.email.endsWith("@itilpn.edu.co")){
    res.redirect('/login?s=1')
  }
  const questions = await questionsdb.find({ mat: 'nat' });
  res.render('pages/form', { user: req.user, questions: questions, mat: 'nat' });
});

app.get('/test/:id', isLoggedIn, async function(req, res) {
  const codigobuscado = req.params.id;
  console.log(req.user.email)
  if(req.user && !req.user.email.endsWith("@itilpn.edu.co")){
    res.redirect('/login?s=1')
  }

  const customsearch = await Custom.findOne({customid: codigobuscado });

  if(!customsearch){
    res.send("No encontrado")
  }
  const questions = await questionsdb.find({ mat: customsearch.mat });
  let filteredq = questions.filter((dato) => customsearch.questions.split(",").includes(dato.cod.toString()));
  console.log(filteredq)
  console.log(customsearch.questions.split(","))
  res.render('pages/test', { user: req.user, questions: filteredq, mat: customsearch.mat, customid: codigobuscado });
});

app.get('/login', function(req, res) {

  // Almacenar la ruta de origen en una cookie o en la sesión del usuario
// antes de redireccionar a la página de inicio de sesión de Google
res.cookie('rutaOrigen', req.headers.referer || '/');

let state = req.query.s ?? null;
 if(state === "1"){
   res.render('pages/login', {error: 1});
 }else   if(state === "2"){
   res.render('pages/login', {error: 2});
 }else {
 res.render('pages/login', {error: null});
 }
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login?s=1',
  failureFlash: true
}));

app.get('/logout', function(req, res) {
  req.logout(function(err) {
    if (err) { return next(err); }
    return res.redirect('/login?s=2');
  });
});

app.get('/admin/addq', isLoggedIn, async function(req, res){

  let rank = req.user.rank ?? null;
  if (rank && (rank === "admin" || rank === "owner")) {
  if(req.query.u === "s") {
    res.render('pages/addquestion', {newElementCod: 0, user: req.user})
  } else if (req.query.u === "e"){
    res.render('pages/addquestion', {newElementCod: 1, user: req.user})
  } else {
    res.render('pages/addquestion', {newElementCod: null, user: req.user})
  }
} else {
  res.send("No tienes permiso");
}
   
})

app.get('/admin', isLoggedIn, async function(req, res){
  let rank = req.user.rank ?? null;
  if (rank && (rank === "admin" || rank === "owner" || rank === "prof")) {
    res.render('pages/admin', {user: req.user})
  } else {
    res.send("No tienes permiso");
  }
})

app.get('/admin/custom', isLoggedIn, async function(req, res){
  let rank = req.user.rank ?? null;
  if (rank && (rank === "admin" || rank === "owner" || rank === "prof")) {

    Custom.find({creator: req.user.email}, async function(err, data) {
      if (data) {
        res.render('pages/customtest', {user: req.user, forms: data})
      }
    });
    
  } else {
    res.send("No tienes permiso");
  }
})

app.post("/createcustom", upload.none(), (req, res) => {
  const form = req.body;
  let customid = "c-"+generarCodigo();

    let newcustom = new Custom({
      mat: form.mat,
      creator: form.email,
      customid: customid,
      questions: form.questions
    })
  
    newcustom.save();
  
  res.redirect("/admin/custom/?u=1")
});

app.get('/admin/custom/create', isLoggedIn, async function(req, res){
  let rank = req.user.rank ?? null;
  let mat = req.query.mat ?? null;
  if (rank && (rank === "admin" || rank === "owner" || rank === "prof")) {

    if(!mat){
      res.redirect("/admin/custom")
    }

  questionsdb.find({ mat: mat }, async function(err, data) {
      if (data) {
        res.render('pages/createcustomtest', {user: req.user, questions: data, mat: mat})
      }
    });
    
  } else {
    res.send("No tienes permiso");
  }
})

app.get('/admin/allresults', isLoggedIn, async function(req, res){
  let rank = req.user.rank ?? null;
  if (rank && (rank === "admin" || rank === "owner" || rank === "prof")) {

    Resp.find({type: "full"}, async function(err, data) {
      if (data) {
        res.render('pages/allresults', {user: req.user, forms: data, mat: null})
      }
    });
    
  } else {
    res.send("No tienes permiso");
  }
})


app.get('/admin/allresults/custom', isLoggedIn, async function(req, res){
  let rank = req.user.rank ?? null;
  if (rank && (rank === "admin" || rank === "owner" || rank === "prof")) {

    Resp.find({type: { $ne: "full" }}, async function(err, data) {
      if (data) {
        res.render('pages/allcustomresults', {user: req.user, forms: data, mat: null})
      }
    });
    
  } else {
    res.send("No tienes permiso");
  }
})

app.get('/admin/manageusers', isLoggedIn, async function(req, res){
  let rank = req.user.rank ?? null;
  if (rank && (rank === "owner")) {

    User.find({}, async function(err, data) {
      if (data) {
        let state = req.query.u ?? null;
        if(state){
          state = parseInt(state)
        }
        res.render('pages/manageusers', {user: req.user, allusers: data.filter(e=> e.email !== req.user.email), newElementCod: state})
      }
    });
    
  } else {
    res.send("No tienes permiso");
  }
})

app.post('/uploadq', upload.single('imageInput'), (req, res) => {
    const form = req.body
    let materia = form.matselector;
    let respuesta = form.p1;
    let rquantity = form.respquantity;
    let tipo = form.type;
    let filename = (req.file ?? {}).filename ?? null;


    var itemscount = 0;
    var itemscount2 = 0;
    var estadofinal = 1;


    cods.findOne({module: "global"}, function(err, found2){

      codarray1 = found2.array;
      if(!codarray1.includes(1)){
          itemscount = 1
          console.log("first: "+itemscount)
      } else if(codarray1.includes(1) && !codarray1.includes(2)){
          itemscount = 2
      } else {
         codarray = codarray1.sort(function (a, b) {  return a - b;  });
      itemscount = findMissingNumber(codarray)
      if(itemscount === undefined){
         itemscount = codarray[codarray.length - 1] + 1
         console.log(`items ${itemscount}`)
      }
      console.log(itemscount)
      console.log(codarray1)
      console.log("sorted "+codarray)
      }
      

      found2.array.push(itemscount)


      cods.findOne({module: materia}, function(err, found3){
  
        codarray2 = found3.array;
        if(!codarray2.includes(1)){
            itemscount2 = 1
            console.log("first: "+itemscount2)
        } else if(codarray2.includes(1) && !codarray1.includes(2)){
            itemscount2 = 2
        } else {
           codarray3 = codarray2.sort(function (a, b) {  return a - b;  });
        itemscount2 = findMissingNumber(codarray3)
        if(itemscount2 === undefined){
           itemscount2 = codarray3[codarray3.length - 1] + 1
           console.log(`items ${itemscount2}`)
        }
        console.log(itemscount2)
        console.log(codarray2)
        console.log("sorted "+codarray3)
        }
        
  
        found3.array.push(itemscount2)
      

    setTimeout( () => {

      let dbcodigos = cods.findOne({module: "global"}, function(err, found3){
        return found3; });

        let codsmat = cods.findOne({module: materia}, function(err, found4){
          return found4; });
  
      dbcodigos.updateOne({ array: found2.array})




let newquestion;

        if(tipo === "1"){
          console.log("Guardado")
     newquestion = new questionsdb({
      mat: materia,
      type: tipo,
      cod: itemscount,
      question: null,
      filename: filename,
      respuesta: null,
      cantidadrespuestas: null
    })
  } else {
    codsmat.updateOne({ array: found3.array})
    console.log("Guardado2")
    newquestion = new questionsdb({
      mat: materia,
      type: tipo,
      cod: itemscount,
      question: itemscount2,
      filename: filename,
      respuesta: respuesta,
      cantidadrespuestas: rquantity
    })
  }
    newquestion.save();
    

    

   return res.redirect("/admin/addq?u=s");

  },200)

      });

});
  });


  function generarCodigo() {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let codigo = '';
    for (let i = 0; i < 20; i++) {
      codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return codigo;
  }

  app.post('/customform', async function(req, res){
    const form = req.body
   console.log(form)
   // console.log(form.userinfo[0])

    let respid = generarCodigo();

      let respuestas = []
     respuestas.resp = Object.values(form).filter((valor, index) => index > 0)
     respuestas.mat = form.userinfo[2]

    const checkedarray = await findQuestions(respuestas);

    let correctas = checkedarray.filter(r => r.endsWith("c"))

    let calculoresultado = parseFloat((correctas.length / checkedarray.length).toFixed(2)) * 100;


    let jsontosave = new Resp({
      mat: form.userinfo[2],
      id: respid,
      email: form.userinfo[0],
      resp: Object.values(form).filter((valor, index) => index > 0),
      result: calculoresultado,
      type: form.userinfo[3]
    });
      //Resp obtiene las respuestas junto con el id del enunciado para luego
      //verificar en el backend de cada usuario las respuestas correctas.

      jsontosave.save();

      return res.redirect("/?l=2&r="+respid);



  })


  app.post('/matform', async function(req, res){
    const form = req.body
   // console.log(form)
   // console.log(form.userinfo[0])

    let respid = generarCodigo();

      let respuestas = []
     respuestas.resp = Object.values(form).filter((valor, index) => index > 0)
     respuestas.mat = form.userinfo[3]
     console.log("Formulario respondido, materia: "+respuestas.mat)
     console.log(form)

    const checkedarray = await findQuestions(respuestas);

    let correctas = checkedarray.filter(r => r.endsWith("c"))

    let calculoresultado = parseFloat((correctas.length / checkedarray.length).toFixed(2)) * 100;


    let jsontosave = new Resp({
      mat: form.userinfo[3],
      id: respid,
      email: form.userinfo[0],
      resp: Object.values(form).filter((valor, index) => index > 0),
      result: calculoresultado,
      type: "full"
    });
      //Resp obtiene las respuestas junto con el id del enunciado para luego
      //verificar en el backend de cada usuario las respuestas correctas.

      jsontosave.save();

      return res.redirect("/?l=2&r="+respid);



  })


  app.use((req, res, next) => {
    res.status(404).send('Página no encontrada');
  });

  

app.listen(2020);
console.log('Server is listening on port 2020');

    
  