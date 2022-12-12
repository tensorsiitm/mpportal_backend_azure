CREATE TABLE public.del_requests
(
    r_id text not null,
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
    document_link text,
    PRIMARY KEY (r_id),
    UNIQUE (r_id)
);
