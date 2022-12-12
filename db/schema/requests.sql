CREATE TABLE public.requests
(
    r_id int not null default nextval('requests_r_id_seq'),
    user_id text NOT NULL,
    name text NOT NULL,
    mobile_no text NOT NULL,
    email text,
    address text,
    posted_time timestamp with time zone not null,
    updated_time timestamp with time zone not null,
    loksabha text,
    assembly text,
    panchayat text,
    ward text,
    pincode int,
    request_subject text NOT NULL,
    request_body text NOT NULL,
    status text NOT NULL,
    status_user text NOT NULL,
    documents text[],
    star int not null default 0,
    PRIMARY KEY (r_id),
    UNIQUE (r_id)
);
