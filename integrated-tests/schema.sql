--
-- PostgreSQL database dump
--

-- Dumped from database version 14.2 (Debian 14.2-1.pgdg110+1)
-- Dumped by pg_dump version 14.2 (Ubuntu 14.2-1.pgdg20.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA public;

--
-- Name: docs; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA docs;


ALTER SCHEMA docs OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: doc_keywords_0; Type: TABLE; Schema: docs; Owner: roger
--

CREATE TABLE docs.doc_keywords_0 (
    dkey text,
    keywords text,
    keywords_lc text,
    keyword_tokens integer,
    keyword_score numeric,
    doc_count integer,
    insert_date date
);


ALTER TABLE docs.doc_keywords_0 OWNER TO roger;

--
-- Name: doc_meta_0; Type: TABLE; Schema: docs; Owner: roger
--

CREATE TABLE docs.doc_meta_0 (
    dkey text NOT NULL,
    raw_id integer,
    meta_key text,
    doc_doi text,
    meta_doi text,
    doi text,
    doi_flag text,
    isbn text,
    journal text,
    doc_title text,
    meta_title text,
    title text,
    doc_pub_date text,
    meta_pub_date text,
    pub_date text,
    doc_author text,
    meta_author text,
    author text,
    doc_size integer,
    insert_date timestamp without time zone,
    multi_row_flag text
);


ALTER TABLE docs.doc_meta_0 OWNER TO roger;

--
-- Name: doc_ngrams_0; Type: TABLE; Schema: docs; Owner: roger
--

CREATE TABLE docs.doc_ngrams_0 (
    dkey text,
    ngram text,
    ngram_lc text,
    ngram_tokens integer,
    ngram_count integer,
    term_freq numeric,
    doc_count integer,
    insert_date date
);


ALTER TABLE docs.doc_ngrams_0 OWNER TO roger;

--
-- Name: dataset; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dataset (
    id integer NOT NULL,
    num_papers integer DEFAULT 0 NOT NULL,
    name text DEFAULT ''::text
);


ALTER TABLE public.dataset OWNER TO postgres;

--
-- Name: dataset_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.dataset_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.dataset_id_seq OWNER TO postgres;

--
-- Name: dataset_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.dataset_id_seq OWNED BY public.dataset.id;


--
-- Name: dataset_paper; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dataset_paper (
    dataset_id integer NOT NULL,
    dkey text NOT NULL
);


ALTER TABLE public.dataset_paper OWNER TO postgres;

--
-- Name: filter_task; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.filter_task (
    id integer NOT NULL,
    created timestamp without time zone NOT NULL,
    start_time timestamp without time zone,
    end_time timestamp without time zone,
    keywords text NOT NULL,
    user_id integer NOT NULL,
    dataset_id integer
);


ALTER TABLE public.filter_task OWNER TO postgres;

--
-- Name: filter_task_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.filter_task_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.filter_task_id_seq OWNER TO postgres;

--
-- Name: filter_task_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.filter_task_id_seq OWNED BY public.filter_task.id;


--
-- Name: register; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.register (
    id integer NOT NULL,
    email text,
    username text,
    accepted boolean,
    accept_key text
);


ALTER TABLE public.register OWNER TO postgres;

--
-- Name: register_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.register_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.register_id_seq OWNER TO postgres;

--
-- Name: register_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.register_id_seq OWNED BY public.register.id;


--
-- Name: session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.session (
    token text NOT NULL,
    created timestamp without time zone NOT NULL,
    last_refresh timestamp without time zone NOT NULL,
    user_id integer NOT NULL
);


ALTER TABLE public.session OWNER TO postgres;

--
-- Name: train_task; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.train_task (
    id integer NOT NULL,
    hparams text NOT NULL,
    created timestamp without time zone NOT NULL,
    start_time timestamp without time zone,
    end_time timestamp without time zone,
    user_id integer NOT NULL,
    dataset_id integer NOT NULL,
    model_id integer
);


ALTER TABLE public.train_task OWNER TO postgres;

--
-- Name: train_task_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.train_task_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.train_task_id_seq OWNER TO postgres;

--
-- Name: train_task_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.train_task_id_seq OWNED BY public.train_task.id;


--
-- Name: trained_model; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trained_model (
    id integer NOT NULL,
    visualization json,
    embeddings_filename text NOT NULL
);


ALTER TABLE public.trained_model OWNER TO postgres;

--
-- Name: trained_model_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.trained_model_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.trained_model_id_seq OWNER TO postgres;

--
-- Name: trained_model_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.trained_model_id_seq OWNED BY public.trained_model.id;


--
-- Name: user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."user" (
    id integer NOT NULL,
    email text NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    is_temp_password boolean NOT NULL
);


ALTER TABLE public."user" OWNER TO postgres;

--
-- Name: user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_id_seq OWNER TO postgres;

--
-- Name: user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_id_seq OWNED BY public."user".id;


--
-- Name: dataset id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dataset ALTER COLUMN id SET DEFAULT nextval('public.dataset_id_seq'::regclass);


--
-- Name: filter_task id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.filter_task ALTER COLUMN id SET DEFAULT nextval('public.filter_task_id_seq'::regclass);


--
-- Name: register id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.register ALTER COLUMN id SET DEFAULT nextval('public.register_id_seq'::regclass);


--
-- Name: train_task id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.train_task ALTER COLUMN id SET DEFAULT nextval('public.train_task_id_seq'::regclass);


--
-- Name: trained_model id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trained_model ALTER COLUMN id SET DEFAULT nextval('public.trained_model_id_seq'::regclass);


--
-- Name: user id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user" ALTER COLUMN id SET DEFAULT nextval('public.user_id_seq'::regclass);


--
-- Name: doc_meta_0 doc_meta_0_pkey; Type: CONSTRAINT; Schema: docs; Owner: roger
--

ALTER TABLE ONLY docs.doc_meta_0
    ADD CONSTRAINT doc_meta_0_pkey PRIMARY KEY (dkey);


--
-- Name: dataset_paper dataset_paper_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dataset_paper
    ADD CONSTRAINT dataset_paper_pkey PRIMARY KEY (dataset_id, dkey);


--
-- Name: dataset dataset_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dataset
    ADD CONSTRAINT dataset_pkey PRIMARY KEY (id);


--
-- Name: filter_task filter_task_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.filter_task
    ADD CONSTRAINT filter_task_pkey PRIMARY KEY (id);


--
-- Name: register register_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.register
    ADD CONSTRAINT register_email_key UNIQUE (email);


--
-- Name: register register_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.register
    ADD CONSTRAINT register_pkey PRIMARY KEY (id);


--
-- Name: register register_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.register
    ADD CONSTRAINT register_username_key UNIQUE (username);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (token);


--
-- Name: train_task train_task_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.train_task
    ADD CONSTRAINT train_task_pkey PRIMARY KEY (id);


--
-- Name: trained_model trained_model_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trained_model
    ADD CONSTRAINT trained_model_pkey PRIMARY KEY (id);


--
-- Name: user user_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_email_key UNIQUE (email);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: user user_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_username_key UNIQUE (username);


--
-- Name: doc_keywords_0_dkey_idx; Type: INDEX; Schema: docs; Owner: roger
--

CREATE INDEX doc_keywords_0_dkey_idx ON docs.doc_keywords_0 USING btree (dkey);


--
-- Name: doc_keywords_0_keywords_lc_idx; Type: INDEX; Schema: docs; Owner: roger
--

CREATE INDEX doc_keywords_0_keywords_lc_idx ON docs.doc_keywords_0 USING btree (keywords_lc);


--
-- Name: doc_ngrams_0_dkey_idx; Type: INDEX; Schema: docs; Owner: roger
--

CREATE INDEX doc_ngrams_0_dkey_idx ON docs.doc_ngrams_0 USING btree (dkey);


--
-- Name: dataset_paper dataset_paper_dataset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dataset_paper
    ADD CONSTRAINT dataset_paper_dataset_id_fkey FOREIGN KEY (dataset_id) REFERENCES public.dataset(id);


--
-- Name: filter_task filter_task_dataset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.filter_task
    ADD CONSTRAINT filter_task_dataset_id_fkey FOREIGN KEY (dataset_id) REFERENCES public.dataset(id);


--
-- Name: filter_task filter_task_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.filter_task
    ADD CONSTRAINT filter_task_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id);


--
-- Name: session session_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id);


--
-- Name: train_task train_task_dataset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.train_task
    ADD CONSTRAINT train_task_dataset_id_fkey FOREIGN KEY (dataset_id) REFERENCES public.dataset(id);


--
-- Name: train_task train_task_model_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.train_task
    ADD CONSTRAINT train_task_model_id_fkey FOREIGN KEY (model_id) REFERENCES public.trained_model(id);


--
-- Name: train_task train_task_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.train_task
    ADD CONSTRAINT train_task_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id);


--
-- PostgreSQL database dump complete
--

