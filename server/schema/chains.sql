-- auto-generated definition
create table chains
(
    id               int unsigned auto_increment
        primary key,
    name             varchar(255)                        not null,
    code             varchar(255)                        not null,
    description      varchar(255)                        null,
    meta_title       varchar(255)                        null,
    meta_description varchar(255)                        null,
    menu_pdf         varchar(100)                        null,
    last_update_by   int unsigned                        null,
    created_at       timestamp default CURRENT_TIMESTAMP not null,
    updated_at       timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
    city_id          int                                 null,
    seo_code         varchar(255)                        null,
    constraint chains_code_unique
        unique (code),
    constraint chains_city_id_foreign
        foreign key (city_id) references cities (id)
            on update cascade,
    constraint chains_last_update_by_foreign
        foreign key (last_update_by) references employees (id)
            on update cascade
)
    collate = utf8mb3_unicode_ci;

