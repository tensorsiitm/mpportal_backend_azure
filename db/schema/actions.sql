CREATE TABLE public.actions
(
    a_id serial,
    r_id text NOT NULL,
    act_no int NOT NULL,
    posted_time timestamp with time zone not null,
    updated_time timestamp with time zone not null,
    action_subject text,
    action_body text,
    action_reply text,
    PRIMARY KEY (a_id),
    UNIQUE (a_id)
);
