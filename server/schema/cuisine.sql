-- auto-generated definition
create table restaurants_cuisines
(
    id             int unsigned auto_increment
        primary key,
    restaurant_id  int unsigned                           not null,
    cuisine_id     int unsigned                           not null,
    priority       int unsigned default '1'               not null,
    last_update_by int unsigned                           null,
    created_at     timestamp    default CURRENT_TIMESTAMP not null,
    updated_at     timestamp    default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
    constraint restaurants_cuisines_restaurant_id_cuisine_id_unique
        unique (restaurant_id, cuisine_id),
    constraint restaurants_cuisines_cuisine_id_foreign
        foreign key (cuisine_id) references cuisines (id)
            on update cascade on delete cascade,
    constraint restaurants_cuisines_last_update_by_foreign
        foreign key (last_update_by) references employees (id)
            on update cascade,
    constraint restaurants_cuisines_restaurant_id_foreign
        foreign key (restaurant_id) references restaurants (id)
            on update cascade on delete cascade
)


-- auto-generated definition
create table cuisines
(
    id             int unsigned auto_increment
        primary key,
    name           varchar(255)                        not null,
    code           varchar(255)                        not null,
    image          varchar(255)                        null,
    description    text                                null,
    last_update_by int unsigned                        null,
    created_at     timestamp default CURRENT_TIMESTAMP not null,
    updated_at     timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
    constraint cuisines_code_unique
        unique (code),
    constraint cuisines_name_unique
        unique (name),
    constraint cuisines_last_update_by_foreign
        foreign key (last_update_by) references employees (id)
            on update cascade
)




