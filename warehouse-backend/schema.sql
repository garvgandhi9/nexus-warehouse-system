--
-- PostgreSQL database dump
--

\restrict oUjvFybR8ScmoC8uNFWmrUKGz1vfQ5U2axJMRjcchQPQT3QgJFeDOz1ZCSDaqeH

-- Dumped from database version 18.3 (Homebrew)
-- Dumped by pg_dump version 18.3 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: contact_messages; Type: TABLE; Schema: public; Owner: garvgandhi
--

CREATE TABLE public.contact_messages (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(20) NOT NULL,
    message text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    source character varying(100),
    context character varying(255),
    category character varying(100),
    tier character varying(50)
);


ALTER TABLE public.contact_messages OWNER TO garvgandhi;

--
-- Name: contact_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: garvgandhi
--

CREATE SEQUENCE public.contact_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.contact_messages_id_seq OWNER TO garvgandhi;

--
-- Name: contact_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: garvgandhi
--

ALTER SEQUENCE public.contact_messages_id_seq OWNED BY public.contact_messages.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: garvgandhi
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_admin boolean DEFAULT false
);


ALTER TABLE public.users OWNER TO garvgandhi;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: garvgandhi
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO garvgandhi;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: garvgandhi
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: warehouses; Type: TABLE; Schema: public; Owner: garvgandhi
--

CREATE TABLE public.warehouses (
    id integer NOT NULL,
    warehouse_code text NOT NULL,
    city text NOT NULL,
    area_available integer,
    rate numeric,
    min_lease text,
    deposit text,
    docks integer,
    ceiling_height numeric,
    nearest_port text,
    nearest_airport text,
    listing_mode text,
    status text DEFAULT 'pending'::text,
    latitude numeric,
    longitude numeric,
    source_name text,
    source_contact text,
    source_designation text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    description text,
    state text,
    pincode text,
    user_id integer,
    term_type character varying(20) DEFAULT 'long_term'::character varying,
    term_duration text,
    power_backup character varying(255),
    compliance character varying(255),
    fire_system character varying(255),
    floor_strength character varying(255),
    amenities text[],
    image_url text,
    org_name text,
    category text,
    industries text[],
    facilities text[],
    contact_person text,
    contact_email text,
    contact_phone text,
    website text,
    address text,
    capacity_value numeric,
    capacity_type character varying(50),
    temperature_range character varying(100),
    product_suitability text[],
    lister_type character varying(50),
    is_prime boolean DEFAULT false,
    lease_type character varying(50),
    full_address text
);


ALTER TABLE public.warehouses OWNER TO garvgandhi;

--
-- Name: warehouses_id_seq; Type: SEQUENCE; Schema: public; Owner: garvgandhi
--

CREATE SEQUENCE public.warehouses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.warehouses_id_seq OWNER TO garvgandhi;

--
-- Name: warehouses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: garvgandhi
--

ALTER SEQUENCE public.warehouses_id_seq OWNED BY public.warehouses.id;


--
-- Name: contact_messages id; Type: DEFAULT; Schema: public; Owner: garvgandhi
--

ALTER TABLE ONLY public.contact_messages ALTER COLUMN id SET DEFAULT nextval('public.contact_messages_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: garvgandhi
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: warehouses id; Type: DEFAULT; Schema: public; Owner: garvgandhi
--

ALTER TABLE ONLY public.warehouses ALTER COLUMN id SET DEFAULT nextval('public.warehouses_id_seq'::regclass);


--
-- Name: contact_messages contact_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: garvgandhi
--

ALTER TABLE ONLY public.contact_messages
    ADD CONSTRAINT contact_messages_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: garvgandhi
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: garvgandhi
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: warehouses warehouses_pkey; Type: CONSTRAINT; Schema: public; Owner: garvgandhi
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT warehouses_pkey PRIMARY KEY (id);


--
-- Name: warehouses warehouses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: garvgandhi
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT warehouses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict oUjvFybR8ScmoC8uNFWmrUKGz1vfQ5U2axJMRjcchQPQT3QgJFeDOz1ZCSDaqeH

