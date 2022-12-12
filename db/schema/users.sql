CREATE TABLE public.users
(
    user_id text,
    name text NOT NULL,
    mobile_no text NOT NULL,
    email text,
    address text,
    loksabha text,
    assembly text,
    panchayat text,
    ward text,
    pincode int,
    PRIMARY KEY (user_id),
    UNIQUE (mobile_no),
    posted_time timestamp with time zone not null
);
