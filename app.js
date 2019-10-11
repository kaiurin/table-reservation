const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({extended: false});
const moment = require('moment');
const knex = require('knex')({
	client: 'mysql',
	connection: {
		host: 'localhost',
		user: 'root',
		password: '121212',
		database: 'restaurant'
	}
});

app.post('/api/reservations', urlencodedParser, function (request, response) {
	if (!request.body) return response.json({
		status: 400,
		message: 'Empty body'
	});
	let timeNow = moment().unix();
	let startTime = moment(request.body.start_time, 'DD/MM/YYYY HH:mm').unix();
	let endTime = moment(request.body.end_time, 'DD/MM/YYYY HH:mm').unix();
	let guestCount = request.body.guest_count;
	if (startTime < timeNow || startTime > endTime || isNaN(startTime) || isNaN(endTime) || !guestCount) {
		response.json({
			status: 400,
			message: 'Invalid data format'
		});
	} else {
		checkTime(endTime, startTime, (error, result) => {
			if (error) return response.json({
				status: 500,
				error
			});
			if (result.length) {
				let arrayIds = result.map(a => a.table_id);
				knex.select('id')
					.from('table')
					.whereNotIn('id', arrayIds)
					.andWhere('capacity', '>=', guestCount)
					.asCallback((error, result) => {
						if (error) return response.json({
							status: 500,
							error
						});
						if (result.length) {
							reserveTable(result[0].id, startTime, endTime, guestCount,
								(error, result) => {
									if (error) return response.json({
										status: 500,
										error
									});
									response.json({
										status: 201,
										message: 'You successfully booked the table',
										order_id: result[0]
									})
								})
						} else {
							response.json({
								status: 400,
								message: 'There no free tables for your conditions!'
							})
						}
					})
			} else {
				knex.select('id')
					.from('table')
					.where('capacity', '>=', guestCount)
					.asCallback((error, result) => {
						if (error) return response.json({
							status: 400,
							error
						});
						if (result.length) {
							reserveTable(result[0].id, startTime, endTime, guestCount,
								(error, result) => {
									if (error) return response.json({
										status: 500,
										error
									});
									response.json({
										status: 201,
										message: 'You successfully booked the table',
										order_id: result[0]
									})
								})
						} else {
							response.json({
								status: 400,
								message: 'There no free tables for your conditions!'
							})
						}
					})
			}
		})
	}
});

app.get('/api/reservations/:id', function (request, response) {
	if (request.params.id) {
		knex.select()
			.from('reservation')
			.where('id', request.params.id)
			.asCallback((error, result) => {
				if (error) return response.json({
					status: 500,
					error
				});
				if (result.length) {
					let startTime = moment(result[0].reservation_start * 1000).format('DD/MM/YYYY HH:mm');
					let endTime = moment(result[0].reservation_end * 1000).format('DD/MM/YYYY HH:mm');
					response.json({
						status: 200,
						table: result[0].table_id,
						start_time: startTime,
						end_time: endTime,
						guest_count: result[0].guest_count
					})
				} else {
					response.json({
						status: 404,
						message: 'There no reservations with this ID!'
					})
				}
			})
	} else {
		response.json({
			status: 400
		})
	}
});

app.put('/api/reservations/:id', urlencodedParser, function (request, response) {
	let timeNow = moment().unix();
	let startTime = moment(request.body.start_time, 'DD/MM/YYYY HH:mm').unix();
	let endTime = moment(request.body.end_time, 'DD/MM/YYYY HH:mm').unix();
	let guestCount = request.body.guest_count;
	if (startTime < timeNow || startTime > endTime || isNaN(startTime) || isNaN(endTime) || !guestCount) return response.json({
		status: 400,
		message: 'Invalid input data format!'
	});
	knex.select()
		.from('reservation')
		.where('id', request.params.id)
		.asCallback((error, result) => {
			if (error) return response.json({
				status: 500,
				error
			});
			if (result.length) {
				checkTime(endTime, startTime, (error, result) => {
					if (error) return response.json({
						status: 500,
						error
					});
					if (result.length) {
						let arrayIds = result.map(a => a.table_id);
						knex.select('id')
							.from('table')
							.whereNotIn('id', arrayIds)
							.andWhere('capacity', '>=', guestCount)
							.asCallback((error, result) => {
								if (error) return response.json({
									status: 500,
									error
								});
								if (result.length) {
									changeReservation(request.params.id, result[0].id,
										startTime, endTime, guestCount, (error, result) => {
											if (error) return response.json({
												status: 500,
												error
											});
											response.json({
												status: 201,
												message: 'You successfully changed your reservation',
												order_id: result[0]
											})
										});
								} else {
									response.json({
										status: 400,
										message: 'There no free tables for your conditions!'
									})
								}
							})
					} else {
						knex.select('id')
							.from('table')
							.where('capacity', '>=', guestCount)
							.asCallback((error, result) => {
								if (error) return response.json({
									status: 400,
									error
								});
								if (result.length) {
									changeReservation(request.params.id, result[0].id,
										startTime, endTime, guestCount, (error, result) => {
											if (error) return response.json({
												status: 500,
												error
											});
											response.json({
												status: 201,
												message: 'You successfully changed your reservation',
												order_id: result[0]
											})
										});
								} else {
									response.json({
										status: 400,
										message: 'There no free tables for your conditions!'
									})
								}
							})
					}
				})
			} else {
				response.json({
					status: 400,
					message: 'There no reservations with this ID!'
				})
			}
		})
});

app.delete('/api/reservations/:id', function (request, response) {
	if (request.params.id) {
		knex('reservation')
			.where('id', request.params.id)
			.del()
			.asCallback((error, result) => {
				if (error) return response.json({
					status: 500,
					error
				});
				if (result) {
					response.json({
						status: 200,
						message: 'Successfully deleted!',
					})
				} else {
					response.json({
						status: 404,
						message: 'There no reservations with this ID!'
					})
				}
			})
	} else {
		response.json({
			status: 400
		})
	}
});

function reserveTable(id, startTime, endTime, guestCount, cb) {
	knex('reservation')
		.insert({
			table_id: id,
			reservation_start: startTime,
			reservation_end: endTime,
			guest_count: guestCount
		})
		.asCallback((error, result) => {
			cb(error, result)
		})
}

function checkTime(endTime, startTime, cb) {
	knex.select()
		.from('reservation')
		.where('reservation_start', '<', endTime)
		.andWhere('reservation_end', '>', startTime)
		.asCallback((error, result) => {
			cb(error, result)
		})
}

function changeReservation(id, table_id, startTime, endTime, guestCount, cb) {
	if (table_id) {
		knex('reservation')
			.where('id', id)
			.update({
				table_id,
				reservation_start: startTime,
				reservation_end: endTime,
				guest_count: guestCount
			})
			.asCallback((error, result) => {
				cb(error, result)
			})
	} else {
		knex('reservation')
			.where('id', id)
			.update({
				reservation_start: startTime,
				reservation_end: endTime,
				guest_count: guestCount
			})
			.asCallback((error, result) => {
				cb(error, result)
			})
	}
}

app.listen(3000);
