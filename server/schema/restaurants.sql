-- auto-generated definition
create table restaurants
(
    id                                int unsigned auto_increment
        primary key,
    name                              varchar(255)                                                                           not null,
    action_url                        varchar(255) collate utf8mb3_bin                                                       not null,
    website                           varchar(255)                                                                           null,
    cost_for_two                      int unsigned                                                                           not null,
    min_pax                           int                                                   default 0                        not null,
    max_pax                           int                                                   default 0                        not null,
    type                              enum ('hotel', 'free standing')                       default 'free standing'          not null,
    deal_supported                    enum ('only_table_reservation', 'only_qsr', 'hybrid') default 'only_table_reservation' not null,
    freecheers_enable                 tinyint(1)                                            default 0                        null,
    address                           varchar(255)                                                                           not null,
    pincode                           varchar(255)                                                                           null,
    landline_number                   varchar(255)                                                                           null,
    mobile_number                     varchar(255)                                                                           null,
    facebook_link                     varchar(255)                                                                           null,
    twitter_link                      varchar(255)                                                                           null,
    instagram_link                    varchar(255)                                                                           null,
    logo                              varchar(255)                                                                           null,
    latitude                          decimal(11, 8)                                                                         not null,
    longitude                         decimal(11, 8)                                                                         not null,
    restaurant_place_id               varchar(255)                                                                           null,
    bookable                          tinyint(1)                                            default 0                        not null,
    category_id                       int unsigned                                                                           not null,
    group_id                          int                                                                                    not null,
    chain_id                          int unsigned                                                                           null,
    rdv_version_code                  varchar(30)                                                                            null,
    billing_rule_id                   int unsigned                                                                           null,
    company_id                        int unsigned                                                                           null,
    gstin                             varchar(100)                                                                           null,
    gst_status                        int                                                                                    null,
    gst_remark                        varchar(255)                                                                           null,
    gst_pincode                       varchar(255)                                                                           null,
    trn                               varchar(255)                                                                           null comment 'Tax Registration Number (TRN) for restaurants outside India',
    pan                               varchar(10)                                                                            null,
    speciality                        text                                                                                   null,
    notes                             text                                                                                   null,
    children_policy                   text                                                                                   null,
    status                            tinyint(1)                                            default 1                        not null,
    inactive_reason                   enum ('permanently closed', 'temporary closed', 'opening soon', 'do_not_show')         null,
    checkin                           tinyint unsigned                                      default '1'                      not null,
    bill_upload                       tinyint(1)                                            default 1                        not null,
    takeaway_allowed                  tinyint(1)                                            default 0                        not null,
    delivery_allowed                  tinyint(1)                                            default 0                        not null,
    dine_in_allowed                   tinyint(1)                                            default 0                        not null,
    in_room_allowed                   tinyint(1)                                            default 0                        not null,
    inventory                         tinyint(1)                                            default 0                        not null,
    livetable                         tinyint(1)                                            default 0                        not null,
    livetable_package                 enum ('full', 'lite', 'inactive')                     default 'inactive'               not null,
    shawman_id                        int                                                                                    null,
    menu_sheet                        varchar(100)                                                                           null,
    menu_pdf                          varchar(100)                                                                           null,
    booking_policy                    text                                                                                   null,
    signup_date                       timestamp                                                                              null,
    liquor_banned                     tinyint(1)                                            default 0                        not null,
    accepts_eazypay_wallet            tinyint(1)                                            default 0                        not null,
    payeazy_serve_charge              float(5, 2)                                           default 2.00                     not null,
    payeazy_allowed_only_with_booking tinyint                                               default 0                        not null,
    payeazy_allowed_only_with_api     tinyint(1)                                            default 0                        not null,
    mail_on_confirm                   tinyint(1)                                            default 0                        not null,
    supervisor_id                     int unsigned                                                                           null,
    waitlist_allow                    tinyint(1)                                            default 1                        not null,
    allow_immediate_booking           tinyint(1)                                            default 1                        not null,
    exclude_gst                       tinyint                                               default 0                        not null,
    last_update_by                    int unsigned                                                                           null,
    created_at                        timestamp                                             default CURRENT_TIMESTAMP        not null,
    updated_at                        timestamp                                             default CURRENT_TIMESTAMP        not null on update CURRENT_TIMESTAMP,
    edtop                             varchar(50)                                                                            not null,
    constraint restaurants_action_url_unique
        unique (action_url),
    constraint restaurants_billing_rule_id_foreign
        foreign key (billing_rule_id) references billing_rules (id)
            on update cascade,
    constraint restaurants_category_id_foreign
        foreign key (category_id) references categories (id)
            on update cascade,
    constraint restaurants_chain_id_foreign
        foreign key (chain_id) references chains (id)
            on update cascade,
    constraint restaurants_company_id_foreign
        foreign key (company_id) references companies (id)
            on update cascade,
    constraint restaurants_group_id_foreign
        foreign key (group_id) references `groups` (id)
            on update cascade,
    constraint restaurants_last_update_by_foreign
        foreign key (last_update_by) references employees (id)
            on update cascade,
    constraint restaurants_supervisor_id_foreign
        foreign key (supervisor_id) references employees (id)
)
    collate = utf8mb3_unicode_ci;

create index billing_rule_id
    on restaurants (billing_rule_id);

create index company_id
    on restaurants (company_id);

