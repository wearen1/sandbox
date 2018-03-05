# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)



users = User.create([
                      {
		                    nick: 'konstruilo',
												email: 'konstruilo@gmail.com',
												password: 'qwerty123',
												first_name: 'Mark',
												last_name: 'Gubarev',
												avatar: 'https://pp.vk.me/c628029/v628029113/5851/fQumbWj3wdQ.jpg',
												status: 1
                      },
                      {
												nick: 'n1russia',
												email: 'n1russia@gmail.com',
												password: 'qwerty123',
												first_name: 'Kirill',
												last_name: 'Dobrinov',
												avatar: 'https://pp.vk.me/c628029/v628029113/5851/fQumbWj3wdQ.jpg',
												status: 1
											},
											{
												nick: 'eadm',
												email: 'eadm@gmail.com',
												password: 'qwerty123',
												first_name: 'Ruslan',
												last_name: 'Davletshin',
												avatar: 'https://pp.vk.me/c628029/v628029113/5851/fQumbWj3wdQ.jpg',
												status: 1
											}
										])
