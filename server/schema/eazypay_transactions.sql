-- auto-generated definition
create table eazypay_transactions
(
    id                       int unsigned auto_increment
        primary key,
    customer_id              int unsigned                                                                         not null,
    booking_id               int unsigned                                                                         null,
    dine_in_order_id         int unsigned                                                                         null,
    is_split_transaction     tinyint(1)       default 0                                                           not null,
    restaurant_id            int unsigned                                                                         null,
    total_amount             double(8, 2) unsigned                                                                not null,
    wallet_amount            double(8, 2) unsigned                                                                null,
    adjusted_cover_charge    double(8, 2) unsigned                                                                null,
    deal_discount_amount     double(8, 2)                                                                         null,
    deal_discount_funded_by  tinyint unsigned default '0'                                                         not null comment '0-restaurant;1-eazydiner;',
    restpe_discount_id       int unsigned                                                                         null,
    coupon_amount            double(8, 2)                                                                         null,
    eazypoints_value         double(8, 2)     default 0.00                                                        null,
    eazypoints               bigint                                                                               null,
    indusindpoints_value     double(8, 2)     default 0.00                                                        null,
    indusind_points          bigint                                                                               null,
    tip_amount               double(8, 2) unsigned                                                                null,
    paid_amount              double(8, 2)                                                                         null,
    refund_amount            double(10, 2)    default 0.00                                                        null,
    status                   enum ('processing', 'complete', 'failed', 'refunded', 'partial_refunded', 'aborted') not null,
    medium                   enum ('android', 'ios', 'web', 'desktop', 'msite')                                   null,
    coupon_ids               varchar(255)                                                                         null,
    remarks                  varchar(255)                                                                         null,
    partner_remaining_amount text                                                                                 null,
    partner_webhook_response text                                                                                 null,
    input_amount             double(8, 2)     default 0.00                                                        not null,
    lat_long                 varchar(30)                                                                          null,
    payeazy_service_charge   float(5, 2)      default 2.00                                                        not null,
    payeazy_per_pax          double(8, 2)     default 0.00                                                        null,
    payeazy_flat_charge      double(8, 2)     default 0.00                                                        null,
    payeazy_percent_charge   double(8, 2)     default 0.00                                                        null,
    paymode_type             varchar(255)                                                                         null,
    paymode                  varchar(255)                                                                         null,
    created_at               timestamp        default CURRENT_TIMESTAMP                                           not null,
    updated_at               timestamp        default CURRENT_TIMESTAMP                                           not null on update CURRENT_TIMESTAMP,
    refund_type              varchar(100)                                                                         null,
    customer_refund_amount   double(8, 2)                                                                         null,
    partner_id               int unsigned                                                                         null,
    constraint eazypay_transactions_dine_in_order_id_foreign
        foreign key (dine_in_order_id) references dine_in_orders (id)
            on update cascade,
    constraint eazypay_transactions_ibfk_1
        foreign key (booking_id) references bookings (id)
            on update cascade on delete cascade,
    constraint eazypay_transactions_ibfk_2
        foreign key (customer_id) references customers (id)
            on update cascade on delete cascade,
    constraint eazypay_transactions_restaurant_id_foreign
        foreign key (restaurant_id) references restaurants (id)
            on update cascade,
    constraint eazypay_transactions_restpe_discount_id_foreign
        foreign key (restpe_discount_id) references restaurant_payeazy_discounts (id)
)
    collate = utf8mb3_unicode_ci;

create index customer_eazypay_transactions_booking_id_foreign
    on eazypay_transactions (booking_id);

create index customer_eazypay_transactions_customer_id_foreign
    on eazypay_transactions (customer_id);
