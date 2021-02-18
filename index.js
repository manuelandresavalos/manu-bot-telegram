const { Telegraf, Markup } = require('telegraf'); // -> Importo Telegraf - https://www.npmjs.com/package/telegraf

// En el apartado de .env es donde se colocan las credenciales y variables de entorno.
// Instancio el Telegraf Bot con el token de mi bot, este lo consigo desde la app de Telegram con el robot BotFather -> /mybots
const bot = new Telegraf(process.env.BOT_TOKEN);

//bot.start se ejecuta cuando una persona lo utiliza por primera vez.
bot.start((ctx) => {
	ctx.reply('Bienvenido/a ManuBot! By Manuel Avalos');
	getAyuda(ctx);
});

//bot.help es un comando propio de telegram (/help) y viene por defecto.
//Cuando invocamos /help, ejecutamos la función que querramos, en este caso una respuesta solicitando un sticker.
bot.help((ctx) => ctx.reply('Send me a sticker'));

//bot.on se ejecuta cuando se recive un tipo de mensaje especifico, ejemplos:
// bot.on("chosen_inline_result")  -> Se ejecuta cuando elijen un inline result (le dieron cklik a un botoncito de los inline_keyboard)
// bot.on("sticker")               -> Se ejecuta cuando el usuario envia un sticker
// bot.on("video")               -> Se ejecuta cuando el usuario envia un video
// Mas info: https://telegraf.js.org/classes/telegraf.html#on
bot.on('sticker', (ctx) => ctx.reply('👍'));

//bot.hears escucha cada mensaje que llega y se fija si machea con la palabra que buscamos, si la coincidencia es exacta, ejecuta la function
//En este caso, si el texto es "hi" se ejecuta. - https://www.geeksforgeeks.org/node-js-bot-hears-method/
bot.hears('hi', (ctx) => ctx.reply('Hey there'));

//Commands
//bot.command se ejecuta cuando ingresamos un comando desde Telegram. /command1 /command2 etc.
bot.command('show_menu', (ctx) => {
	showMenu(ctx);
});

bot.command('saludar', (ctx) => {
	console.log(ctx);
	// Using context shortcut
	ctx.reply(`Hola cabeza de pollo`);
});

bot.command('ayuda', (ctx) => {
	getAyuda(ctx);
});

bot.command('farmacia_de_turno', (ctx) => {
	getFarmaciaDeTurno(ctx, farmaciasJSON);
});

bot.command('farmacias', (ctx) => {
	getFarmacias(ctx, farmaciasJSON);
});

bot.command('quit', (ctx) => {
	// Using context shortcut
	ctx.leaveChat();
});

bot.command('keyboard1', (ctx) =>
	//Para poner botones y el extra de parse HTML
	ctx.telegram.sendMessage(ctx.chat.id, '<b>keyboard1</b>: Se muestran super grandes debajo del input text', {
		reply_markup: {
			keyboard: [
				[
					{ text: '/ayuda' },
					{ text: '/farmacia_de_turno' },
					{ text: '/farmacias' }
				]
			]
		},
		parse_mode: 'HTML'
	})
);

bot.command('keyboard2', (ctx) =>
	//Para poner botones y el extra de parse HTML
	ctx.telegram.sendMessage(ctx.chat.id, '<b>keyboard2</b>: inline_keyboard -> Para urls que se abren en el browser', {
		reply_markup: {
			inline_keyboard: [
				[
					{ text: 'Google', url: 'www.google.com' },
					{ text: 'Facebook', url: 'www.facebook.com' },
					{ text: '🐤 Twitter', url: 'www.twitter.com' }
				],
				[
					{ text: 'Google', url: 'www.google.com' },
					{ text: 'Facebook', url: 'www.facebook.com' },
					{ text: '🐤 Twitter', url: 'www.twitter.com' }
				]
			]
		},
		parse_mode: 'HTML'
	})
);

function showMenu(ctx) {
	//Para poner botones y el extra de parse HTML
	ctx.telegram.sendMessage(ctx.chat.id, 'Elige una opción', {
		reply_markup: {
			inline_keyboard: [
				[
					{ text: 'Farmacias', callback_data: 'farmacias' }
				],
				[
					{ text: 'Farmacia de Turno', callback_data: 'farmacia_de_turno' }
				]
			]
		},
		parse_mode: 'HTML'
	});
}

//bot.action se ejecuta cuando nosotros desde el código lanzamos un evento, por ejemplo cuando armamos un inline_keyboard con un boton y ese boton hace un callback_data:
/*
ctx.telegram.sendMessage(ctx.chat.id, "Elige una opción", {
  reply_markup: {
    inline_keyboard: [
      [{ text: "Farmacias", callback_data: "farmacias" }], // -> Al hacer click, lanza el evento "farmacias" y es capturado por bot.action("farmacias")
      [{ text: "Farmacia de Turno", callback_data: "farmacia_de_turno" }]
    ]
  },
  parse_mode: "HTML"
})
*/
bot.action('ayuda', (ctx) => {
	ctx.deleteMessage();
	getAyuda(ctx);
});

bot.action('farmacias', (ctx) => {
	ctx.deleteMessage();
	getFarmacias(ctx);
});

bot.action('farmacia_de_turno', (ctx) => {
	ctx.deleteMessage();
	getFarmaciaDeTurno(ctx);
});

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

/* --------------------------------------------------- */
function goBackToMenu(ctx) {
	//Para poner botones y el extra de parse HTML
	ctx.telegram.sendMessage(ctx.chat.id, 'Volver al menu', {
		reply_markup: {
			inline_keyboard: [
				[
					{ text: 'Volver al Menu', callback_data: 'volver_al_menu' }
				]
			]
		},
		parse_mode: 'HTML'
	});
}

function getAyuda(ctx) {
	bot.telegram.getMyCommands().then((listOfCommands) => {
		let message = 'Puedes realizar las siguientes acciones:\n';
		listOfCommands.forEach((commandObj) => {
			message += '/' + commandObj.command + '\n';
			message += '' + commandObj.description + '\n\n';
		});

		ctx.reply(message);
	});
}

function getFarmacias(ctx) {
	let message = '';
	let farmaciasArr = filterArrayOfObjectByProperty(farmaciasJSON.farmacias, 'FARMACIA');
	farmaciasArr.forEach((farma) => {
		message += 'Farmacia: ' + farma.FARMACIA + '\n';
		message += 'Dirección: ' + farma.DIRECCION + '\n';
		message += 'Teléfono: ' + farma['T.E.'];
		message += '\n\n';
	});

	//shorcut of ctx.telegram.sendMessage(ctx.chat.id, message);
	ctx.reply(message);
}

function getFarmaciaDeTurno(ctx) {
	const today = getToday();
	const farmaNode = farmaciasJSON.farmacias.find((nodo) => nodo.DATE == today);
	let message = 'De turno hoy - ' + today + '\n\n';
	message += 'Farmacia: ' + farmaNode.FARMACIA + '\n';
	message += 'Dirección: ' + farmaNode.DIRECCION + '\n';
	message += 'Teléfono: ' + farmaNode['T.E.'];

	ctx.reply(message);
}

// Filtra los objetos repetidos de un array de objetos dependiendo la propiedad por la que se quiera filtrar
function filterArrayOfObjectByProperty(array, prop) {
	let hash = {};
	let farmaArray = array.filter(function(current) {
		var exists = !hash[current[prop]];
		hash[current[prop]] = true;
		return exists;
	});

	return farmaArray;
}

function getToday() {
	let date = new Date();
	let day = date.getDate() > 9 ? date.getDate() : '0' + date.getDate();
	let month = date.getMonth() > 8 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1);
	let year = date.getFullYear();

	return day + '/' + month + '/' + year;
}

/*
FARMACIAS JSON
*/
// Convertidor de PDF a Excel: https://www.adobe.com/la/acrobat/online/pdf-to-excel.html
// Archivo original de famacias: https://docs.google.com/spreadsheets/d/1cTKaS9muSk70vXxbiNfrGJy1OBzcRlb6/edit#gid=270141205
// El archivo spreadsheet creado a partir del excel anterior es el siguiente: https://docs.google.com/spreadsheets/d/1KX_vxM4qQsgaeufs6FuKKdUF9zPgstY3vmTPuFwmCno/edit#gid=0
// JSON generado con https://beautifytools.com/excel-to-json-converter.php utilizando el archivo spreadsheet generado.

/*
PASO A PASO:
  1) Descargo el pdf de todas las farmacias de turno del mes:  http://www.msaludsgo.gov.ar/web2/files//2021/TURNOS%2002-2021.pdf
  2) Convierto el pdf en excel con esta tool: https://www.adobe.com/la/acrobat/online/pdf-to-excel.html
  3) Convierto el excel a spreadsheet subiendo el excel y guardandolo como spreadsheet
  4) Busco el apartado de la ciudad que quiero y lo modifico para que quede de la siguiente manera:
  ... ver aqui -> https://docs.google.com/spreadsheets/d/1KX_vxM4qQsgaeufs6FuKKdUF9zPgstY3vmTPuFwmCno/edit#gid=0
    DATE        |  FARMACIA	      |  DIRECCION     |  T.E.          |  GRUPO
    01/02/2020  |  OMEGA	        |  PUEYRREDON 37 |	03844-423583	|  1
    02/02/2020  |  SAAD AÑATUYA	  | BLA BLA BLA 17 |	03844-4215687	|  2
  ...
  5) Transformo este spreadsheet en un JSON con la siguiente herramienta https://beautifytools.com/excel-to-json-converter.php
  6) Reemplazo este ojbeto por el nuevo.
*/
var farmaciasJSON = {
	farmacias: [
		{
			DATE: '01/02/2021',
			FARMACIA: 'SAAD AÑATUYA',
			DIRECCION: '25 DE MAYO 297',
			'T.E.': '+543844421214',
			GRUPO: '7'
		},
		{
			DATE: '02/02/2021',
			FARMACIA: 'AZAR',
			DIRECCION: 'PUEYRREDON 137',
			'T.E.': '+543844421283',
			GRUPO: '8'
		},
		{
			DATE: '03/02/2021',
			FARMACIA: 'FOP',
			DIRECCION: '25 DE MAYO  (S) 73',
			'T.E.': '+543844423108',
			GRUPO: '9'
		},
		{
			DATE: '04/02/2021',
			FARMACIA: 'GALENICA',
			DIRECCION: 'BELGRANO Y FCO DE AGUIRRE',
			GRUPO: '10'
		},
		{
			DATE: '05/02/2021',
			FARMACIA: 'OMEGA',
			DIRECCION: 'PUEYRREDON 37',
			'T.E.': '+543844423583',
			GRUPO: '1'
		},
		{
			DATE: '06/02/2021',
			FARMACIA: 'NATIVIDAD',
			DIRECCION: 'AV. ESPAÑA Y FRANCISCO DE AGUIRRE',
			'T.E.': '+543844421424',
			GRUPO: '2'
		},
		{
			DATE: '07/02/2021',
			FARMACIA: '9 DE JULIO',
			DIRECCION: '9 DE JULIO 353',
			'T.E.': '+543844423457',
			GRUPO: '3'
		},
		{
			DATE: '08/02/2021',
			FARMACIA: 'AÑATUYA',
			DIRECCION: 'BELGRANO Y ALVEAR',
			'T.E.': '+543844421464',
			GRUPO: '4'
		},
		{
			DATE: '09/02/2021',
			FARMACIA: 'AUAT MARCELA',
			DIRECCION: '25 DE MAYO 80',
			'T.E.': '+543844421276',
			GRUPO: '5'
		},
		{
			DATE: '10/02/2021',
			FARMACIA: 'DEL ROSARIO',
			DIRECCION: 'AV. DUMAS ESQ. ALBERDI',
			'T.E.': '+543844423578',
			GRUPO: '6'
		},
		{
			DATE: '11/02/2021',
			FARMACIA: 'SAAD AÑATUYA',
			DIRECCION: '25 DE MAYO 297',
			'T.E.': '+543844421214',
			GRUPO: '7'
		},
		{
			DATE: '12/02/2021',
			FARMACIA: 'AZAR',
			DIRECCION: 'PUEYRREDON 137',
			'T.E.': '+543844421283',
			GRUPO: '8'
		},
		{
			DATE: '13/02/2021',
			FARMACIA: 'FOP',
			DIRECCION: '25 DE MAYO  (S) 73',
			'T.E.': '+543844423108',
			GRUPO: '9'
		},
		{
			DATE: '14/02/2021',
			FARMACIA: 'GALENICA',
			DIRECCION: 'BELGRANO Y FCO DE AGUIRRE',
			GRUPO: '10'
		},
		{
			DATE: '15/02/2021',
			FARMACIA: 'OMEGA',
			DIRECCION: 'PUEYRREDON 37',
			'T.E.': '+543844423583',
			GRUPO: '1'
		},
		{
			DATE: '16/02/2021',
			FARMACIA: 'NATIVIDAD',
			DIRECCION: 'AV. ESPAÑA Y FRANCISCO DE AGUIRRE',
			'T.E.': '+543844421424',
			GRUPO: '2'
		},
		{
			DATE: '17/02/2021',
			FARMACIA: '9 DE JULIO',
			DIRECCION: '9 DE JULIO 353',
			'T.E.': '+543844423457',
			GRUPO: '3'
		},
		{
			DATE: '18/02/2021',
			FARMACIA: 'AÑATUYA',
			DIRECCION: 'BELGRANO Y ALVEAR',
			'T.E.': '+543844421464',
			GRUPO: '4'
		},
		{
			DATE: '19/02/2021',
			FARMACIA: 'AUAT MARCELA',
			DIRECCION: '25 DE MAYO 80',
			'T.E.': '+543844421276',
			GRUPO: '5'
		},
		{
			DATE: '20/02/2021',
			FARMACIA: 'DEL ROSARIO',
			DIRECCION: 'AV. DUMAS ESQ. ALBERDI',
			'T.E.': '+543844423578',
			GRUPO: '6'
		},
		{
			DATE: '21/02/2021',
			FARMACIA: 'SAAD AÑATUYA',
			DIRECCION: '25 DE MAYO 297',
			'T.E.': '+543844421214',
			GRUPO: '7'
		},
		{
			DATE: '22/02/2021',
			FARMACIA: 'AZAR',
			DIRECCION: 'PUEYRREDON 137',
			'T.E.': '+543844421283',
			GRUPO: '8'
		},
		{
			DATE: '23/02/2021',
			FARMACIA: 'FOP',
			DIRECCION: '25 DE MAYO  (S) 73',
			'T.E.': '+543844423108',
			GRUPO: '9'
		},
		{
			DATE: '24/02/2021',
			FARMACIA: 'GALENICA',
			DIRECCION: 'BELGRANO Y FCO DE AGUIRRE',
			GRUPO: '10'
		},
		{
			DATE: '25/02/2021',
			FARMACIA: 'OMEGA',
			DIRECCION: 'PUEYRREDON 37',
			'T.E.': '+543844423583',
			GRUPO: '1'
		},
		{
			DATE: '26/02/2021',
			FARMACIA: 'NATIVIDAD',
			DIRECCION: 'AV. ESPAÑA Y FRANCISCO DE AGUIRRE',
			'T.E.': '+543844421424',
			GRUPO: '2'
		},
		{
			DATE: '27/02/2021',
			FARMACIA: '9 DE JULIO',
			DIRECCION: '9 DE JULIO 353',
			'T.E.': '+543844423457',
			GRUPO: '3'
		},
		{
			DATE: '28/02/2021',
			FARMACIA: 'AÑATUYA',
			DIRECCION: 'BELGRANO Y ALVEAR',
			'T.E.': '+543844421464',
			GRUPO: '4'
		}
	]
};
