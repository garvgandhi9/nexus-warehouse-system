--
-- PostgreSQL database dump
--

\restrict J0kNAd46S8aRTwr8WhYaIxjuRVjOASkYXceyqr9EDkhWhjn1tJq99alJhLiRtkn

-- Dumped from database version 18.3 (Debian 18.3-1.pgdg12+1)
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

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: nexus_0axo_user
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO nexus_0axo_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: contact_messages; Type: TABLE; Schema: public; Owner: nexus_0axo_user
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


ALTER TABLE public.contact_messages OWNER TO nexus_0axo_user;

--
-- Name: contact_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: nexus_0axo_user
--

CREATE SEQUENCE public.contact_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.contact_messages_id_seq OWNER TO nexus_0axo_user;

--
-- Name: contact_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nexus_0axo_user
--

ALTER SEQUENCE public.contact_messages_id_seq OWNED BY public.contact_messages.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: nexus_0axo_user
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_admin boolean DEFAULT false
);


ALTER TABLE public.users OWNER TO nexus_0axo_user;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: nexus_0axo_user
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO nexus_0axo_user;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nexus_0axo_user
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: warehouses; Type: TABLE; Schema: public; Owner: nexus_0axo_user
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


ALTER TABLE public.warehouses OWNER TO nexus_0axo_user;

--
-- Name: warehouses_id_seq; Type: SEQUENCE; Schema: public; Owner: nexus_0axo_user
--

CREATE SEQUENCE public.warehouses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.warehouses_id_seq OWNER TO nexus_0axo_user;

--
-- Name: warehouses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nexus_0axo_user
--

ALTER SEQUENCE public.warehouses_id_seq OWNED BY public.warehouses.id;


--
-- Name: contact_messages id; Type: DEFAULT; Schema: public; Owner: nexus_0axo_user
--

ALTER TABLE ONLY public.contact_messages ALTER COLUMN id SET DEFAULT nextval('public.contact_messages_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: nexus_0axo_user
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: warehouses id; Type: DEFAULT; Schema: public; Owner: nexus_0axo_user
--

ALTER TABLE ONLY public.warehouses ALTER COLUMN id SET DEFAULT nextval('public.warehouses_id_seq'::regclass);


--
-- Data for Name: contact_messages; Type: TABLE DATA; Schema: public; Owner: nexus_0axo_user
--

COPY public.contact_messages (id, name, email, phone, message, created_at, source, context, category, tier) FROM stdin;
7	final	45@gmail.com	3453453453	demo	2026-03-06 15:10:04.049678	Direct Contact	General	Other	Prime
8	dd	dd@gmail.com	2343212345	yo	2026-03-06 15:10:33.991312	Listing	General	Flexible Warehousing	Standard
9	test1	test1@gmail.com	8768768764	test1	2026-03-06 15:16:15.811527	Listing	Mumbai · WP-1012	Build-to-Suit	Standard
10	test2	test2@gmail.com	2342342343	test2	2026-03-06 15:16:42.387508	Direct Contact	General	Managed Network	Prime
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: nexus_0axo_user
--

COPY public.users (id, name, email, password, created_at, is_admin) FROM stdin;
1	gg	garvgandhi@gmail.com	$2b$10$boBE9VyV14xl727OMzhkSe4vv.0NzsI1xBg6cQdW4uQ03OS3q3Eea	2026-03-04 17:02:06.494049	f
2	Nexus Admin	admin@nexus.com	$2b$10$FiteVa2yuJTsAwivJebHY.mnRrcj.NxwD5MBXOD1KCbBJE/Mb5hNe	2026-03-04 17:17:06.840816	t
3	Test User	test_1772693227766@example.com	$2b$10$/xMczlD1yylwQWTMs.iYr.lfJ18L/MfbYjxTcJX174f1tAcJQev4u	2026-03-05 12:17:09.341748	f
4	demo	gg@gmail.com	$2b$10$k0ShUUnVONueRXMU0Lp3N.KAX2.pKS8xba173UujgXFucEUFqVa4q	2026-03-06 13:17:44.197791	f
5	Bhavya Ladha	bhavya@bismarckgroup.in	$2b$10$SOmvMRtND1pMDGYp5hEXE.YK9RVsFRnpot2P3ZXkHIVnQ/UKTz9BG	2026-03-13 06:34:52.22313	f
6	Megha Sharma	megha.aretejuris@gmail.com	$2b$10$Yj2sA0RmpayYMF89q4KmTuoplFFe1hMJS/6KWzgSs.ic71YEMsVdu	2026-03-13 10:34:47.570113	f
\.


--
-- Data for Name: warehouses; Type: TABLE DATA; Schema: public; Owner: nexus_0axo_user
--

COPY public.warehouses (id, warehouse_code, city, area_available, rate, min_lease, deposit, docks, ceiling_height, nearest_port, nearest_airport, listing_mode, status, latitude, longitude, source_name, source_contact, source_designation, created_at, description, state, pincode, user_id, term_type, term_duration, power_backup, compliance, fire_system, floor_strength, amenities, image_url, org_name, category, industries, facilities, contact_person, contact_email, contact_phone, website, address, capacity_value, capacity_type, temperature_range, product_suitability, lister_type, is_prime, lease_type, full_address) FROM stdin;
185	WP-1000	Mumbai	15000	38	\N	\N	3	32	\N	\N	\N	Available	18.8677842	73.0303352	info@acfslogistics.in	9967468946	\N	2026-03-05 15:37:19.624164	\N	Maharashtra	\N	\N	long_term	\N	\N	\N	\N	\N	{"Truck parking","Handling equipment","Palletised storage","CCTV cameras",Washrooms,"Water supply(direct or tanker)"}	https://nexusvaluechain.com/wp-content/uploads/2025/11/IMG_0782-Atharva-Dandawate.jpeg	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N
186	WP-1001	Mumbai	15000	32	\N	\N	2	12	\N	\N	\N	Available	19.265431441822347	73.06951314210893	karanj9100@gmail.com	7843091000	\N	2026-03-05 15:37:19.624164	<p class="font_8 wixui-rich-text__text"><span class="wixui-rich-text__text">We at Bhairav Logistics C/o Shree Bhairav Transport &amp; Co. are one of the leading logistics companies in Bhiwandi, proudly offering top-notch 3PL services since 1962. With a strong foothold in the Mumbai (Bhiwandi) region, we specialize in warehousing services and comprehensive logistics management. </span></p>\r\n<p class="font_8 wixui-rich-text__text"><span class="wixui-rich-text__text"><span class="wixGuard wixui-rich-text__text">​</span></span></p>\r\n<p class="font_8 wixui-rich-text__text"><span class="wixui-rich-text__text">Our dedicated team of professionals work tirelessly to keep operations seamless, making us a trusted name among logistics companies in Bhiwandi. With over 60 years of experience, our progressive legacy sets us apart as a premier provider of 3PL &amp; warehousing services. Whether you need a reliable 3PL warehouse or end-to-end logistics support, SB Logistics is here to deliver excellence every step of the way.</span></p>	Maharashtra	\N	\N	long_term	\N	\N	\N	\N	\N	{"Handling equipment","Palletised storage","Power backup/generator","CCTV cameras",Washrooms,"office space","Water supply(direct or tanker)"}	https://nexusvaluechain.com/wp-content/uploads/2025/11/WhatsApp-Image-2025-11-14-at-11.44.15-AM-3.jpeg	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N
187	WP-1002	Mumbai	30000	26	\N	\N	4	35	\N	\N	\N	Available	18.883659	73.270031	salunkhemahesh1981@gmail.com	7744003790	\N	2026-03-05 15:37:19.624164	\N	Maharashtra	\N	\N	long_term	\N	\N	\N	\N	\N	{"Truck parking","Fire Hydrants","CCTV cameras",Washrooms,"office space","Security cabin","Water supply(direct or tanker)","Dock levellers"}	https://nexusvaluechain.com/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-03-at-17.58.03_730eea8e.jpg	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N
188	WP-1003	Mumbai	17000	35	\N	\N	6	35	\N	\N	\N	Available	18.9704929	73.1324019	bhavya@bismarckgroup.in	9967468946	\N	2026-03-05 15:37:19.624164	Located in the prime area of Palaspe phata, this warehouse offers seamless connectivity to JNPT, Navi Mumbai Airport and Mumbai-Pune highway(NH 48) and Mumbai-Goa highway(NH 66) right upon exiting the warehouse	Maharashtra	\N	\N	long_term	\N	\N	\N	\N	\N	{"Truck parking","Fire Hydrants","CCTV cameras",Washrooms,"office space","Security cabin","Water supply(direct or tanker)","Dock levellers"}	https://nexusvaluechain.com/wp-content/uploads/2025/12/paras1.jpeg	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N
189	WP-1004	Nashik	3000	25	\N	\N	3	15	\N	\N	\N	Available	20.1439719	73.891865	bhavya@bismarckgroup.in	9967468946	\N	2026-03-05 15:37:19.624164	Located in the northern outskirts of Nashik near Mohadi, this warehouse offers the ideal location of Agri produce or any FnB commodities to Northern and Central India. Ample of parking space makes the warehouse ideal for business who have a faster inventory turnaround time	Maharashtra	\N	\N	long_term	\N	\N	\N	\N	\N	{"Truck parking","Palletised storage","Fire Hydrants","CCTV cameras",Washrooms,"Security cabin","Water supply(direct or tanker)","Dock levellers"}	https://nexusvaluechain.com/wp-content/uploads/2025/12/Screenshot-201.png	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N
190	WP-1005	Mumbai	30000	24	\N	\N	4	35	\N	\N	\N	Available	18.767012899813047	73.31829359452203	bhavya@bismarckgroup.in	9967468946	\N	2026-03-05 15:37:19.624164	Ready to move by 15th january 2026, this warehouse is located in the Industrial belt between Takai and Atkargaon, Khopoli. Situated in a valley with hills on 3 sides and 900 ft above sea level, this place has never experienced waterlogging and stays cool throughout the year. A river flows 100 metres from the land, providing ample of water supply with 300 kVa power commissioned to the warehouse. Above this, there is plenty of land available for expansion/built to suit in the same plot, which makes the place ideal for anyone looking to expand operations in the near future.	Maharashtra	\N	\N	long_term	\N	\N	\N	\N	\N	{"Truck parking","Handling equipment","CCTV cameras",Washrooms,"office space","Security cabin","Water supply(direct or tanker)","Dock levellers"}	https://nexusvaluechain.com/wp-content/uploads/2025/12/yajurWH3.jpeg	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N
191	WP-1006	Mumbai	20000	23	\N	\N	3	35	\N	\N	\N	Available	18.76692825086502	73.31880020595337	bhavya@bismarckgroup.in	9967468946	\N	2026-03-05 15:37:19.624164	With 6 inch concretised floor, this warehouse is perfect for industrial use and storage. The shed has two 50 ton cranes with a gantry girder for linear movement. Enough space for a 40ft container truck to enter the space for loading/unloading purposes. Attached to the main shed is a leaning roof at 15 ft height for a separate storage space. For ventilation, there are louvers at the top shed.	Maharashtra	\N	\N	long_term	\N	\N	\N	\N	\N	{"Truck parking","Handling equipment","Fire Hydrants","Power backup/generator","CCTV cameras",Washrooms,"office space","Security cabin","Water supply(direct or tanker)"}	https://nexusvaluechain.com/wp-content/uploads/2025/12/POPWH5.jpeg	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N
192	WP-1007	Mumbai	500000	40	\N	\N	16	40	\N	\N	\N	Available	18.9262648	73.0302632	bhavya@bismarckgroup.in	9967468946	\N	2026-03-05 15:37:19.624164	Out of the 5 lakh sqft, 25000 sqft is available for immediate use in the grade A warehouse.	Maharashtra	\N	\N	long_term	\N	\N	\N	\N	\N	{"Truck parking","Handling equipment","Palletised storage","Fire Sprinklers","Fire Hydrants","Power backup/generator","CCTV cameras",Washrooms,"office space","Security cabin","Water supply(direct or tanker)","Dock levellers"}	https://nexusvaluechain.com/wp-content/uploads/2025/12/IMG-20251110-WA0025-Prakhar-Goenka.jpg	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N
193	WP-1008	Mumbai	12000	20	\N	\N	4	18	\N	\N	\N	Available	19.3025562	73.0588072	bhavya@bismarckgroup.in	9967468946	\N	2026-03-05 15:37:19.624164	\N	Maharashtra	\N	\N	long_term	\N	\N	\N	\N	\N	{"Truck parking","Handling equipment","Palletised storage","Fire Hydrants","CCTV cameras",Washrooms,"office space","Security cabin","Water supply(direct or tanker)","Dock levellers"}	https://nexusvaluechain.com/wp-content/uploads/2025/12/robinWH2.jpg	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N
194	WP-1009	Mumbai	11000	25	\N	\N	4	32	\N	\N	\N	Available	18.952308	73.168821	bhavya@bismarckgroup.in	9967468946	\N	2026-03-05 15:37:19.624164	Situated in a very prime location. 5 km from Navi Mumbai airport, JNPT is 25km, 3 km from Panvel railway station, this warehouse is just touching the old Mumbai Pune highway. There is ample open space for big trucks and trailors to move.	Maharashtra	\N	\N	long_term	\N	\N	\N	\N	\N	{"Truck parking","Handling equipment","Palletised storage","Fire Hydrants","CCTV cameras",Washrooms,"office space","Security cabin","Water supply(direct or tanker)","Dock levellers"}	https://nexusvaluechain.com/wp-content/uploads/2025/12/surisWH3.jpg	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N
195	WP-1010	Mumbai	140000	35	\N	\N	13	45	\N	\N	\N	Available	19.0120315	73.080156	bhavya@bismarckgroup.in	9967468946	\N	2026-03-05 15:37:19.624164	\N	Maharashtra	\N	\N	long_term	\N	\N	\N	\N	\N	{"Truck parking","Handling equipment","Palletised storage","Fire Sprinklers","Fire Hydrants","Power backup/generator","CCTV cameras",Washrooms,"office space","Security cabin","Water supply(direct or tanker)","Dock levellers"}	https://nexusvaluechain.com/wp-content/uploads/2025/12/Screenshot-212.png	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N
196	WP-1011	Mumbai	10000	24	\N	\N	5	26	\N	\N	\N	Available	19.2698428	73.0828323	bhavya@bismarckgroup.in	9967468946	\N	2026-03-05 15:37:19.624164	Images only for representation. Not actual	Maharashtra	\N	\N	long_term	\N	\N	\N	\N	\N	{"Truck parking","Palletised storage","Fire Hydrants","Power backup/generator","CCTV cameras",Washrooms,"office space","Security cabin","Water supply(direct or tanker)","Dock levellers"}	https://nexusvaluechain.com/wp-content/uploads/2025/12/rapidaddyWh3.jpeg	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N
197	WP-1012	Mumbai	300	40	\N	\N	1	12	\N	\N	\N	Available	19.114297827385933	73.02546297089346	bhavya@bismarckgroup.in	9967468946	\N	2026-03-05 15:37:19.624164	Cold storage facility with dry storage available as well in a shared space. Located in mahape MIDC, this warehouse caters to anyone seeking proximity to Navi Mumbai and Mumbai via Vashi bridge.	Maharashtra	\N	\N	long_term	\N	\N	\N	\N	\N	{"Truck parking","Handling equipment","Palletised storage","Fire Hydrants","CCTV cameras",Washrooms,"office space","Security cabin","Water supply(direct or tanker)","Dock levellers"}	https://nexusvaluechain.com/wp-content/uploads/2025/12/bajoriaWH4-1.jpeg	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N
198	WP-1013	Mumbai	60000	\N	\N	\N	4	40	\N	\N	\N	Available	19.1585731	72.9994763	bhavya@bismarckgroup.in	9967468946	\N	2026-03-05 15:37:19.624164	State of the art facility right in the heart of Navi Mumbai, this facility provides a flexible warehousing space to anyone looking to fulfill their peak season requirements. The facility is built with world class roofing structures and is fully compliant with ample of parking space. Forklifts are available full time with steel grated walkways for movement.	Maharashtra	\N	\N	long_term	\N	\N	\N	\N	\N	{"Truck parking","Handling equipment","Palletised storage","Fire Sprinklers","Fire Hydrants","Power backup/generator","CCTV cameras",Washrooms,"office space","Security cabin","Water supply(direct or tanker)","Dock levellers"}	https://nexusvaluechain.com/wp-content/uploads/2025/12/TOIWH5.jpeg	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N
199	demo-1772790531622	Mumbai	250000	28	\N	\N	4	32	\N	\N	\N	Available	\N	\N	\N	\N	\N	2026-03-06 15:18:51.636427	demo	\N	\N	2	long_term	\N	\N	\N	\N	9	\N	\N	demo	General Grade B	{"Cold storage"}	{"Office space","Handling equipment",Washrooms,"Dock levellers"}	gg	\N	2342342342	\N	\N	250000	sq_ft	\N	{}	Business	t	Partial Space	\N
\.


--
-- Name: contact_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: nexus_0axo_user
--

SELECT pg_catalog.setval('public.contact_messages_id_seq', 10, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: nexus_0axo_user
--

SELECT pg_catalog.setval('public.users_id_seq', 6, true);


--
-- Name: warehouses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: nexus_0axo_user
--

SELECT pg_catalog.setval('public.warehouses_id_seq', 201, true);


--
-- Name: contact_messages contact_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: nexus_0axo_user
--

ALTER TABLE ONLY public.contact_messages
    ADD CONSTRAINT contact_messages_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: nexus_0axo_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: nexus_0axo_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: warehouses warehouses_pkey; Type: CONSTRAINT; Schema: public; Owner: nexus_0axo_user
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT warehouses_pkey PRIMARY KEY (id);


--
-- Name: warehouses warehouses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nexus_0axo_user
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT warehouses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON SEQUENCES TO nexus_0axo_user;


--
-- Name: DEFAULT PRIVILEGES FOR TYPES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TYPES TO nexus_0axo_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON FUNCTIONS TO nexus_0axo_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TABLES TO nexus_0axo_user;


--
-- PostgreSQL database dump complete
--

\unrestrict J0kNAd46S8aRTwr8WhYaIxjuRVjOASkYXceyqr9EDkhWhjn1tJq99alJhLiRtkn

