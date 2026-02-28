-- auto-generated definition
create table customers
(
    id                           int unsigned auto_increment
        primary key,
    name                         varchar(255)                                                                           null,
    email                        varchar(255)                                                                           null,
    mobile                       varchar(16)                                                                            null,
    password                     varchar(60)                                                                            not null,
    otp                          varchar(6)                                                                             null,
    otp_expiry                   datetime                                                                               null,
    otp_sent_count               int              default 0                                                             not null,
    referral_code                varchar(255)                                                                           null,
    booker_id                    int unsigned                                                                           null,
    virtual_id                   varchar(32)                                                                            null,
    designation                  varchar(255)                                                                           null,
    organization                 varchar(255)                                                                           null,
    image                        varchar(255)                                                                           null,
    secondary_email              varchar(255)                                                                           null,
    dob                          date                                                                                   null,
    anniversary                  date                                                                                   null,
    gender                       enum ('Male', 'Female')                                                                null,
    address                      mediumtext                                                                             null,
    city_id                      int                                                                                    null,
    region_id                    int                                                                                    null,
    medium                       enum ('android', 'ios', 'web', 'concierge', 'google', 'api_partner', 'booking_widget') not null,
    source                       varchar(100)                                                                           null,
    utm_source                   varchar(255)                                                                           null,
    utm_medium                   varchar(255)                                                                           null,
    utm_campaign                 varchar(255)                                                                           null,
    is_blocked                   tinyint(1)       default 0                                                             not null,
    verified                     tinyint(1)       default 0                                                             not null,
    blocked_reason               varchar(255)                                                                           null,
    block_upto                   timestamp                                                                              null,
    checkin                      tinyint unsigned default '1'                                                           not null,
    bill_upload                  tinyint(1)       default 1                                                             not null,
    remember_token               varchar(100)                                                                           null,
    app_installed                tinyint(1)       default 0                                                             not null,
    shawman_customer_id          int                                                                                    null,
    statement_sent_on            datetime         default '2015-01-01 00:00:00'                                         not null,
    wallet_last_expiry_date      date                                                                                   null,
    transaction_block_till       datetime                                                                               null,
    lifetime_savings             double(8, 2)                                                                           null,
    email_verified               tinyint          default 0                                                             not null,
    email_verify_code            varchar(255)                                                                           null,
    email_verify_code_expires_at timestamp                                                                              null,
    email_verified_at            timestamp                                                                              null,
    created_at                   timestamp        default CURRENT_TIMESTAMP                                             not null,
    updated_at                   timestamp        default CURRENT_TIMESTAMP                                             not null on update CURRENT_TIMESTAMP,
    constraint booker_id
        unique (booker_id),
    constraint customers_mobile_unique
        unique (mobile),
    constraint customers_virtual_id_unique
        unique (virtual_id),
    constraint referral_code
        unique (referral_code),
    constraint customers_city_id_foreign
        foreign key (city_id) references cities (id)
            on update cascade,
    constraint customers_region_id_foreign
        foreign key (region_id) references regions (id)
            on update cascade
)
    collate = utf8mb3_unicode_ci;

create index customers_created_at_idx
    on customers (created_at);

create index customers_is_blocked_idx
    on customers (is_blocked);

create index email
    on customers (email);

