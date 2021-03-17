drop table if exists Countries;

create table Countries(
id serial primary key,
country varchar,
totalconfirmed varchar,
totaldeaths varchar,
totalrecovered varchar,
date varchar
);