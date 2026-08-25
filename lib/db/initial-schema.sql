--
-- PostgreSQL database dump
--


-- Dumped from database version 16.14 (Homebrew)
-- Dumped by pg_dump version 16.14 (Homebrew)

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
-- Name: _locales; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public._locales AS ENUM (
    'pl',
    'en'
);


--
-- Name: enum_bookings_payment_method; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_bookings_payment_method AS ENUM (
    'blik',
    'transfer',
    'online',
    'cash',
    'card_onsite'
);


--
-- Name: enum_bookings_payment_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_bookings_payment_status AS ENUM (
    'unpaid',
    'deposit_paid',
    'paid',
    'refunded'
);


--
-- Name: enum_bookings_source; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_bookings_source AS ENUM (
    'website',
    'manual_admin',
    'phone',
    'google_calendar'
);


--
-- Name: enum_bookings_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_bookings_status AS ENUM (
    'pending',
    'confirmed',
    'cancelled',
    'expired',
    'deposit_paid'
);


--
-- Name: enum_features_icon_name; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_features_icon_name AS ENUM (
    'star',
    'map',
    'shield',
    'users',
    'phone',
    'camera'
);


--
-- Name: enum_flota_page_equipment_items_icon_name; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_flota_page_equipment_items_icon_name AS ENUM (
    'shield',
    'sparkles',
    'fuel',
    'wrench'
);


--
-- Name: enum_gallery_items_layout; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_gallery_items_layout AS ENUM (
    '1x1',
    '2x1',
    '1x2',
    '2x2',
    '3x1'
);


--
-- Name: enum_home_page_hero_booking_panel_steps_icon_name; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_home_page_hero_booking_panel_steps_icon_name AS ENUM (
    'clock',
    'users',
    'map',
    'shield'
);


--
-- Name: enum_home_page_hero_media_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_home_page_hero_media_type AS ENUM (
    'image',
    'video'
);


--
-- Name: enum_process_steps_icon_name; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_process_steps_icon_name AS ENUM (
    'phone',
    'shield',
    'map',
    'camera',
    'star',
    'users'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: about_page; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.about_page (
    id integer NOT NULL,
    seo_image_id integer,
    updated_at timestamp(3) with time zone,
    created_at timestamp(3) with time zone
);


--
-- Name: about_page_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.about_page_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: about_page_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.about_page_id_seq OWNED BY public.about_page.id;


--
-- Name: about_page_locales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.about_page_locales (
    seo_title character varying,
    seo_description character varying,
    header_title character varying,
    header_description character varying,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id integer NOT NULL
);


--
-- Name: about_page_locales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.about_page_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: about_page_locales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.about_page_locales_id_seq OWNED BY public.about_page_locales.id;


--
-- Name: booking_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.booking_settings (
    id integer NOT NULL,
    total_quads numeric DEFAULT 4 NOT NULL,
    open_hour numeric DEFAULT 8 NOT NULL,
    close_hour numeric DEFAULT 18 NOT NULL,
    min_booking_lead_hours numeric DEFAULT 5 NOT NULL,
    hold_minutes numeric DEFAULT 15 NOT NULL,
    cashbill_live_enabled boolean DEFAULT false,
    cashbill_shop_id character varying DEFAULT 'tatraoffroad.pl'::character varying,
    cashbill_secret character varying,
    gcal_calendar_id character varying,
    gcal_service_account_json character varying,
    updated_at timestamp(3) with time zone,
    created_at timestamp(3) with time zone
);


--
-- Name: booking_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.booking_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: booking_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.booking_settings_id_seq OWNED BY public.booking_settings.id;


--
-- Name: bookings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bookings (
    id integer NOT NULL,
    trip_id integer,
    booking_date timestamp(3) with time zone NOT NULL,
    booking_time character varying NOT NULL,
    reservation_end_time character varying,
    duration_hours numeric DEFAULT 1 NOT NULL,
    drivers numeric DEFAULT 1 NOT NULL,
    passengers numeric DEFAULT 0 NOT NULL,
    people numeric,
    customer_first_name character varying,
    customer_last_name character varying,
    customer_phone character varying NOT NULL,
    customer_email character varying,
    customer_notes character varying,
    source public.enum_bookings_source DEFAULT 'website'::public.enum_bookings_source NOT NULL,
    status public.enum_bookings_status DEFAULT 'pending'::public.enum_bookings_status NOT NULL,
    full_price numeric,
    deposit_amount numeric,
    remaining_amount numeric,
    payment_status public.enum_bookings_payment_status DEFAULT 'unpaid'::public.enum_bookings_payment_status,
    payment_method public.enum_bookings_payment_method,
    cashbill_payment_id character varying,
    cashbill_channel character varying,
    session_id character varying,
    gcal_event_id character varying,
    expires_at timestamp(3) with time zone,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


--
-- Name: bookings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bookings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bookings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bookings_id_seq OWNED BY public.bookings.id;


--
-- Name: cennik_page; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cennik_page (
    id integer NOT NULL,
    seo_image_id integer,
    updated_at timestamp(3) with time zone,
    created_at timestamp(3) with time zone
);


--
-- Name: cennik_page_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cennik_page_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cennik_page_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cennik_page_id_seq OWNED BY public.cennik_page.id;


--
-- Name: cennik_page_locales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cennik_page_locales (
    seo_title character varying,
    seo_description character varying,
    header_title character varying,
    header_description character varying,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id integer NOT NULL
);


--
-- Name: cennik_page_locales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cennik_page_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cennik_page_locales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cennik_page_locales_id_seq OWNED BY public.cennik_page_locales.id;


--
-- Name: contact_page; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contact_page (
    id integer NOT NULL,
    seo_image_id integer,
    updated_at timestamp(3) with time zone,
    created_at timestamp(3) with time zone
);


--
-- Name: contact_page_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.contact_page_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: contact_page_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.contact_page_id_seq OWNED BY public.contact_page.id;


--
-- Name: contact_page_locales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contact_page_locales (
    seo_title character varying,
    seo_description character varying,
    header_title character varying,
    header_description character varying,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id integer NOT NULL
);


--
-- Name: contact_page_locales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.contact_page_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: contact_page_locales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.contact_page_locales_id_seq OWNED BY public.contact_page_locales.id;


--
-- Name: faq_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.faq_items (
    id integer NOT NULL,
    sort_order numeric DEFAULT 0,
    active boolean DEFAULT true,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


--
-- Name: faq_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.faq_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: faq_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.faq_items_id_seq OWNED BY public.faq_items.id;


--
-- Name: faq_items_locales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.faq_items_locales (
    question character varying NOT NULL,
    answer character varying NOT NULL,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id integer NOT NULL
);


--
-- Name: faq_items_locales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.faq_items_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: faq_items_locales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.faq_items_locales_id_seq OWNED BY public.faq_items_locales.id;


--
-- Name: features; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.features (
    id integer NOT NULL,
    icon_name public.enum_features_icon_name DEFAULT 'star'::public.enum_features_icon_name,
    sort_order numeric DEFAULT 0,
    active boolean DEFAULT true,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


--
-- Name: features_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.features_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: features_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.features_id_seq OWNED BY public.features.id;


--
-- Name: features_locales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.features_locales (
    title character varying NOT NULL,
    description character varying,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id integer NOT NULL
);


--
-- Name: features_locales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.features_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: features_locales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.features_locales_id_seq OWNED BY public.features_locales.id;


--
-- Name: fleet_vehicles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fleet_vehicles (
    id integer NOT NULL,
    power character varying,
    drive character varying,
    seats character varying,
    year character varying,
    image_id integer,
    image_url character varying,
    sort_order numeric DEFAULT 0,
    active boolean DEFAULT true,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


--
-- Name: fleet_vehicles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.fleet_vehicles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: fleet_vehicles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.fleet_vehicles_id_seq OWNED BY public.fleet_vehicles.id;


--
-- Name: fleet_vehicles_locales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fleet_vehicles_locales (
    name character varying NOT NULL,
    type character varying,
    badge character varying,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id integer NOT NULL
);


--
-- Name: fleet_vehicles_locales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.fleet_vehicles_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: fleet_vehicles_locales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.fleet_vehicles_locales_id_seq OWNED BY public.fleet_vehicles_locales.id;


--
-- Name: flota_page; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.flota_page (
    id integer NOT NULL,
    seo_image_id integer,
    updated_at timestamp(3) with time zone,
    created_at timestamp(3) with time zone
);


--
-- Name: flota_page_equipment_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.flota_page_equipment_items (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    icon_name public.enum_flota_page_equipment_items_icon_name DEFAULT 'shield'::public.enum_flota_page_equipment_items_icon_name
);


--
-- Name: flota_page_equipment_items_locales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.flota_page_equipment_items_locales (
    title character varying NOT NULL,
    description character varying,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id character varying NOT NULL
);


--
-- Name: flota_page_equipment_items_locales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.flota_page_equipment_items_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: flota_page_equipment_items_locales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.flota_page_equipment_items_locales_id_seq OWNED BY public.flota_page_equipment_items_locales.id;


--
-- Name: flota_page_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.flota_page_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: flota_page_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.flota_page_id_seq OWNED BY public.flota_page.id;


--
-- Name: flota_page_locales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.flota_page_locales (
    seo_title character varying,
    seo_description character varying,
    header_title character varying,
    header_description character varying,
    equipment_eyebrow character varying,
    equipment_title character varying,
    equipment_description character varying,
    cta_title character varying,
    cta_description character varying,
    cta_button_label character varying,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id integer NOT NULL
);


--
-- Name: flota_page_locales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.flota_page_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: flota_page_locales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.flota_page_locales_id_seq OWNED BY public.flota_page_locales.id;


--
-- Name: gallery_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gallery_items (
    id integer NOT NULL,
    image_id integer,
    image_url character varying,
    layout public.enum_gallery_items_layout DEFAULT '1x1'::public.enum_gallery_items_layout,
    sort_order numeric DEFAULT 0,
    active boolean DEFAULT true,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


--
-- Name: gallery_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.gallery_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: gallery_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.gallery_items_id_seq OWNED BY public.gallery_items.id;


--
-- Name: gallery_items_locales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gallery_items_locales (
    caption character varying NOT NULL,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id integer NOT NULL
);


--
-- Name: gallery_items_locales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.gallery_items_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: gallery_items_locales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.gallery_items_locales_id_seq OWNED BY public.gallery_items_locales.id;


--
-- Name: home_page; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.home_page (
    id integer NOT NULL,
    seo_image_id integer,
    hero_media_type public.enum_home_page_hero_media_type DEFAULT 'image'::public.enum_home_page_hero_media_type,
    hero_bg_image_id integer,
    hero_bg_image_url character varying,
    hero_video_id integer,
    hero_video_url character varying,
    cta_banner_bg_image_id integer,
    cta_banner_bg_image_url character varying,
    updated_at timestamp(3) with time zone,
    created_at timestamp(3) with time zone
);


--
-- Name: home_page_hero_badges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.home_page_hero_badges (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL
);


--
-- Name: home_page_hero_badges_locales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.home_page_hero_badges_locales (
    label character varying NOT NULL,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id character varying NOT NULL
);


--
-- Name: home_page_hero_badges_locales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.home_page_hero_badges_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: home_page_hero_badges_locales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.home_page_hero_badges_locales_id_seq OWNED BY public.home_page_hero_badges_locales.id;


--
-- Name: home_page_hero_booking_panel_steps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.home_page_hero_booking_panel_steps (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    icon_name public.enum_home_page_hero_booking_panel_steps_icon_name DEFAULT 'clock'::public.enum_home_page_hero_booking_panel_steps_icon_name
);


--
-- Name: home_page_hero_booking_panel_steps_locales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.home_page_hero_booking_panel_steps_locales (
    text character varying NOT NULL,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id character varying NOT NULL
);


--
-- Name: home_page_hero_booking_panel_steps_locales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.home_page_hero_booking_panel_steps_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: home_page_hero_booking_panel_steps_locales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.home_page_hero_booking_panel_steps_locales_id_seq OWNED BY public.home_page_hero_booking_panel_steps_locales.id;


--
-- Name: home_page_hero_stats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.home_page_hero_stats (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    value character varying NOT NULL
);


--
-- Name: home_page_hero_stats_locales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.home_page_hero_stats_locales (
    label character varying NOT NULL,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id character varying NOT NULL
);


--
-- Name: home_page_hero_stats_locales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.home_page_hero_stats_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: home_page_hero_stats_locales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.home_page_hero_stats_locales_id_seq OWNED BY public.home_page_hero_stats_locales.id;


--
-- Name: home_page_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.home_page_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: home_page_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.home_page_id_seq OWNED BY public.home_page.id;


--
-- Name: home_page_locales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.home_page_locales (
    seo_title character varying,
    seo_description character varying,
    hero_headline character varying,
    hero_highlight_word character varying,
    hero_subheadline character varying,
    hero_lead character varying,
    hero_primary_cta_label character varying DEFAULT 'Zarezerwuj online'::character varying,
    hero_secondary_cta_label character varying DEFAULT 'Zobacz ceny'::character varying,
    hero_booking_panel_eyebrow character varying DEFAULT 'Szybka Rezerwacja'::character varying,
    hero_booking_panel_title character varying DEFAULT 'Start w 4 krokach'::character varying,
    hero_booking_panel_button_label character varying DEFAULT 'Sprawdź dostępność'::character varying,
    hero_booking_panel_fine_print character varying DEFAULT 'Zaliczka online · reszta na miejscu · potwierdzenie od razu'::character varying,
    cta_banner_eyebrow character varying,
    cta_banner_title_line1 character varying,
    cta_banner_title_highlight character varying,
    cta_banner_description character varying,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id integer NOT NULL
);


--
-- Name: home_page_locales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.home_page_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: home_page_locales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.home_page_locales_id_seq OWNED BY public.home_page_locales.id;


--
-- Name: home_page_marquee_phrases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.home_page_marquee_phrases (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL
);


--
-- Name: home_page_marquee_phrases_locales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.home_page_marquee_phrases_locales (
    text character varying NOT NULL,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id character varying NOT NULL
);


--
-- Name: home_page_marquee_phrases_locales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.home_page_marquee_phrases_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: home_page_marquee_phrases_locales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.home_page_marquee_phrases_locales_id_seq OWNED BY public.home_page_marquee_phrases_locales.id;


--
-- Name: media; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.media (
    id integer NOT NULL,
    alt character varying NOT NULL,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    url character varying,
    thumbnail_u_r_l character varying,
    filename character varying,
    mime_type character varying,
    filesize numeric,
    width numeric,
    height numeric,
    focal_x numeric,
    focal_y numeric
);


--
-- Name: media_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.media_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: media_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.media_id_seq OWNED BY public.media.id;


--
-- Name: news_posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.news_posts (
    id integer NOT NULL,
    slug character varying NOT NULL,
    author character varying DEFAULT 'Tatra Off-Road Team'::character varying,
    published_at timestamp(3) with time zone NOT NULL,
    image_id integer,
    image_url character varying,
    active boolean DEFAULT true,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


--
-- Name: news_posts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.news_posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: news_posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.news_posts_id_seq OWNED BY public.news_posts.id;


--
-- Name: news_posts_locales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.news_posts_locales (
    title character varying NOT NULL,
    excerpt character varying,
    content character varying,
    meta_title character varying,
    meta_description character varying,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id integer NOT NULL
);


--
-- Name: news_posts_locales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.news_posts_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: news_posts_locales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.news_posts_locales_id_seq OWNED BY public.news_posts_locales.id;


--
-- Name: payload_kv; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payload_kv (
    id integer NOT NULL,
    key character varying NOT NULL,
    data jsonb NOT NULL
);


--
-- Name: payload_kv_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payload_kv_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payload_kv_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payload_kv_id_seq OWNED BY public.payload_kv.id;


--
-- Name: payload_locked_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payload_locked_documents (
    id integer NOT NULL,
    global_slug character varying,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


--
-- Name: payload_locked_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payload_locked_documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payload_locked_documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payload_locked_documents_id_seq OWNED BY public.payload_locked_documents.id;


--
-- Name: payload_locked_documents_rels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payload_locked_documents_rels (
    id integer NOT NULL,
    "order" integer,
    parent_id integer NOT NULL,
    path character varying NOT NULL,
    users_id integer,
    media_id integer,
    trips_id integer,
    bookings_id integer,
    fleet_vehicles_id integer,
    tour_routes_id integer,
    features_id integer,
    process_steps_id integer,
    reviews_id integer,
    faq_items_id integer,
    gallery_items_id integer,
    news_posts_id integer
);


--
-- Name: payload_locked_documents_rels_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payload_locked_documents_rels_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payload_locked_documents_rels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payload_locked_documents_rels_id_seq OWNED BY public.payload_locked_documents_rels.id;


--
-- Name: payload_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payload_migrations (
    id integer NOT NULL,
    name character varying,
    batch numeric,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


--
-- Name: payload_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payload_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payload_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payload_migrations_id_seq OWNED BY public.payload_migrations.id;


--
-- Name: payload_preferences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payload_preferences (
    id integer NOT NULL,
    key character varying,
    value jsonb,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


--
-- Name: payload_preferences_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payload_preferences_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payload_preferences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payload_preferences_id_seq OWNED BY public.payload_preferences.id;


--
-- Name: payload_preferences_rels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payload_preferences_rels (
    id integer NOT NULL,
    "order" integer,
    parent_id integer NOT NULL,
    path character varying NOT NULL,
    users_id integer
);


--
-- Name: payload_preferences_rels_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payload_preferences_rels_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payload_preferences_rels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payload_preferences_rels_id_seq OWNED BY public.payload_preferences_rels.id;


--
-- Name: process_steps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.process_steps (
    id integer NOT NULL,
    step_num character varying NOT NULL,
    icon_name public.enum_process_steps_icon_name DEFAULT 'phone'::public.enum_process_steps_icon_name,
    sort_order numeric DEFAULT 0,
    active boolean DEFAULT true,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


--
-- Name: process_steps_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.process_steps_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: process_steps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.process_steps_id_seq OWNED BY public.process_steps.id;


--
-- Name: process_steps_locales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.process_steps_locales (
    title character varying NOT NULL,
    description character varying,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id integer NOT NULL
);


--
-- Name: process_steps_locales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.process_steps_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: process_steps_locales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.process_steps_locales_id_seq OWNED BY public.process_steps_locales.id;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews (
    id integer NOT NULL,
    author character varying NOT NULL,
    rating numeric DEFAULT 5 NOT NULL,
    sort_order numeric DEFAULT 0,
    active boolean DEFAULT true,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- Name: reviews_locales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews_locales (
    location character varying,
    content character varying NOT NULL,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id integer NOT NULL
);


--
-- Name: reviews_locales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reviews_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reviews_locales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reviews_locales_id_seq OWNED BY public.reviews_locales.id;


--
-- Name: site_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_settings (
    id integer NOT NULL,
    email character varying,
    whatsapp character varying,
    updated_at timestamp(3) with time zone,
    created_at timestamp(3) with time zone
);


--
-- Name: site_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.site_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: site_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.site_settings_id_seq OWNED BY public.site_settings.id;


--
-- Name: site_settings_locales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_settings_locales (
    address character varying,
    hours character varying,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id integer NOT NULL
);


--
-- Name: site_settings_locales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.site_settings_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: site_settings_locales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.site_settings_locales_id_seq OWNED BY public.site_settings_locales.id;


--
-- Name: site_settings_phones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_settings_phones (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    number character varying NOT NULL
);


--
-- Name: tour_routes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tour_routes (
    id integer NOT NULL,
    image_id integer,
    image_url character varying,
    sort_order numeric DEFAULT 0,
    active boolean DEFAULT true,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


--
-- Name: tour_routes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tour_routes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tour_routes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tour_routes_id_seq OWNED BY public.tour_routes.id;


--
-- Name: tour_routes_locales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tour_routes_locales (
    title character varying NOT NULL,
    route_num character varying,
    difficulty character varying,
    description character varying,
    distance character varying,
    duration character varying,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id integer NOT NULL
);


--
-- Name: tour_routes_locales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tour_routes_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tour_routes_locales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tour_routes_locales_id_seq OWNED BY public.tour_routes_locales.id;


--
-- Name: trasy_page; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.trasy_page (
    id integer NOT NULL,
    seo_image_id integer,
    updated_at timestamp(3) with time zone,
    created_at timestamp(3) with time zone
);


--
-- Name: trasy_page_extra_blocks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.trasy_page_extra_blocks (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    image_id integer,
    image_url character varying
);


--
-- Name: trasy_page_extra_blocks_locales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.trasy_page_extra_blocks_locales (
    title character varying NOT NULL,
    description character varying,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id character varying NOT NULL
);


--
-- Name: trasy_page_extra_blocks_locales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.trasy_page_extra_blocks_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: trasy_page_extra_blocks_locales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.trasy_page_extra_blocks_locales_id_seq OWNED BY public.trasy_page_extra_blocks_locales.id;


--
-- Name: trasy_page_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.trasy_page_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: trasy_page_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.trasy_page_id_seq OWNED BY public.trasy_page.id;


--
-- Name: trasy_page_locales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.trasy_page_locales (
    seo_title character varying,
    seo_description character varying,
    header_title character varying,
    header_description character varying,
    extra_eyebrow character varying,
    extra_title character varying,
    extra_description character varying,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id integer NOT NULL
);


--
-- Name: trasy_page_locales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.trasy_page_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: trasy_page_locales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.trasy_page_locales_id_seq OWNED BY public.trasy_page_locales.id;


--
-- Name: trips; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.trips (
    id integer NOT NULL,
    name character varying NOT NULL,
    description character varying,
    duration_hours numeric DEFAULT 1 NOT NULL,
    price1 numeric DEFAULT 250 NOT NULL,
    price2 numeric DEFAULT 300 NOT NULL,
    deposit numeric DEFAULT 50 NOT NULL,
    active boolean DEFAULT true,
    sort_order numeric DEFAULT 0,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


--
-- Name: trips_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.trips_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: trips_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.trips_id_seq OWNED BY public.trips.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    email character varying NOT NULL,
    reset_password_token character varying,
    reset_password_expiration timestamp(3) with time zone,
    salt character varying,
    hash character varying,
    login_attempts numeric DEFAULT 0,
    lock_until timestamp(3) with time zone
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: users_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users_sessions (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    created_at timestamp(3) with time zone,
    expires_at timestamp(3) with time zone NOT NULL
);


--
-- Name: about_page id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.about_page ALTER COLUMN id SET DEFAULT nextval('public.about_page_id_seq'::regclass);


--
-- Name: about_page_locales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.about_page_locales ALTER COLUMN id SET DEFAULT nextval('public.about_page_locales_id_seq'::regclass);


--
-- Name: booking_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_settings ALTER COLUMN id SET DEFAULT nextval('public.booking_settings_id_seq'::regclass);


--
-- Name: bookings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings ALTER COLUMN id SET DEFAULT nextval('public.bookings_id_seq'::regclass);


--
-- Name: cennik_page id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cennik_page ALTER COLUMN id SET DEFAULT nextval('public.cennik_page_id_seq'::regclass);


--
-- Name: cennik_page_locales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cennik_page_locales ALTER COLUMN id SET DEFAULT nextval('public.cennik_page_locales_id_seq'::regclass);


--
-- Name: contact_page id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_page ALTER COLUMN id SET DEFAULT nextval('public.contact_page_id_seq'::regclass);


--
-- Name: contact_page_locales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_page_locales ALTER COLUMN id SET DEFAULT nextval('public.contact_page_locales_id_seq'::regclass);


--
-- Name: faq_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faq_items ALTER COLUMN id SET DEFAULT nextval('public.faq_items_id_seq'::regclass);


--
-- Name: faq_items_locales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faq_items_locales ALTER COLUMN id SET DEFAULT nextval('public.faq_items_locales_id_seq'::regclass);


--
-- Name: features id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.features ALTER COLUMN id SET DEFAULT nextval('public.features_id_seq'::regclass);


--
-- Name: features_locales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.features_locales ALTER COLUMN id SET DEFAULT nextval('public.features_locales_id_seq'::regclass);


--
-- Name: fleet_vehicles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fleet_vehicles ALTER COLUMN id SET DEFAULT nextval('public.fleet_vehicles_id_seq'::regclass);


--
-- Name: fleet_vehicles_locales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fleet_vehicles_locales ALTER COLUMN id SET DEFAULT nextval('public.fleet_vehicles_locales_id_seq'::regclass);


--
-- Name: flota_page id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flota_page ALTER COLUMN id SET DEFAULT nextval('public.flota_page_id_seq'::regclass);


--
-- Name: flota_page_equipment_items_locales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flota_page_equipment_items_locales ALTER COLUMN id SET DEFAULT nextval('public.flota_page_equipment_items_locales_id_seq'::regclass);


--
-- Name: flota_page_locales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flota_page_locales ALTER COLUMN id SET DEFAULT nextval('public.flota_page_locales_id_seq'::regclass);


--
-- Name: gallery_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gallery_items ALTER COLUMN id SET DEFAULT nextval('public.gallery_items_id_seq'::regclass);


--
-- Name: gallery_items_locales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gallery_items_locales ALTER COLUMN id SET DEFAULT nextval('public.gallery_items_locales_id_seq'::regclass);


--
-- Name: home_page id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.home_page ALTER COLUMN id SET DEFAULT nextval('public.home_page_id_seq'::regclass);


--
-- Name: home_page_hero_badges_locales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.home_page_hero_badges_locales ALTER COLUMN id SET DEFAULT nextval('public.home_page_hero_badges_locales_id_seq'::regclass);


--
-- Name: home_page_hero_booking_panel_steps_locales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.home_page_hero_booking_panel_steps_locales ALTER COLUMN id SET DEFAULT nextval('public.home_page_hero_booking_panel_steps_locales_id_seq'::regclass);


--
-- Name: home_page_hero_stats_locales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.home_page_hero_stats_locales ALTER COLUMN id SET DEFAULT nextval('public.home_page_hero_stats_locales_id_seq'::regclass);


--
-- Name: home_page_locales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.home_page_locales ALTER COLUMN id SET DEFAULT nextval('public.home_page_locales_id_seq'::regclass);


--
-- Name: home_page_marquee_phrases_locales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.home_page_marquee_phrases_locales ALTER COLUMN id SET DEFAULT nextval('public.home_page_marquee_phrases_locales_id_seq'::regclass);


--
-- Name: media id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media ALTER COLUMN id SET DEFAULT nextval('public.media_id_seq'::regclass);


--
-- Name: news_posts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.news_posts ALTER COLUMN id SET DEFAULT nextval('public.news_posts_id_seq'::regclass);


--
-- Name: news_posts_locales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.news_posts_locales ALTER COLUMN id SET DEFAULT nextval('public.news_posts_locales_id_seq'::regclass);


--
-- Name: payload_kv id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_kv ALTER COLUMN id SET DEFAULT nextval('public.payload_kv_id_seq'::regclass);


--
-- Name: payload_locked_documents id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents ALTER COLUMN id SET DEFAULT nextval('public.payload_locked_documents_id_seq'::regclass);


--
-- Name: payload_locked_documents_rels id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels ALTER COLUMN id SET DEFAULT nextval('public.payload_locked_documents_rels_id_seq'::regclass);


--
-- Name: payload_migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_migrations ALTER COLUMN id SET DEFAULT nextval('public.payload_migrations_id_seq'::regclass);


--
-- Name: payload_preferences id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_preferences ALTER COLUMN id SET DEFAULT nextval('public.payload_preferences_id_seq'::regclass);


--
-- Name: payload_preferences_rels id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_preferences_rels ALTER COLUMN id SET DEFAULT nextval('public.payload_preferences_rels_id_seq'::regclass);


--
-- Name: process_steps id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.process_steps ALTER COLUMN id SET DEFAULT nextval('public.process_steps_id_seq'::regclass);


--
-- Name: process_steps_locales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.process_steps_locales ALTER COLUMN id SET DEFAULT nextval('public.process_steps_locales_id_seq'::regclass);


--
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- Name: reviews_locales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews_locales ALTER COLUMN id SET DEFAULT nextval('public.reviews_locales_id_seq'::regclass);


--
-- Name: site_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings ALTER COLUMN id SET DEFAULT nextval('public.site_settings_id_seq'::regclass);


--
-- Name: site_settings_locales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings_locales ALTER COLUMN id SET DEFAULT nextval('public.site_settings_locales_id_seq'::regclass);


--
-- Name: tour_routes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_routes ALTER COLUMN id SET DEFAULT nextval('public.tour_routes_id_seq'::regclass);


--
-- Name: tour_routes_locales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_routes_locales ALTER COLUMN id SET DEFAULT nextval('public.tour_routes_locales_id_seq'::regclass);


--
-- Name: trasy_page id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trasy_page ALTER COLUMN id SET DEFAULT nextval('public.trasy_page_id_seq'::regclass);


--
-- Name: trasy_page_extra_blocks_locales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trasy_page_extra_blocks_locales ALTER COLUMN id SET DEFAULT nextval('public.trasy_page_extra_blocks_locales_id_seq'::regclass);


--
-- Name: trasy_page_locales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trasy_page_locales ALTER COLUMN id SET DEFAULT nextval('public.trasy_page_locales_id_seq'::regclass);


--
-- Name: trips id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trips ALTER COLUMN id SET DEFAULT nextval('public.trips_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: about_page_locales about_page_locales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.about_page_locales
    ADD CONSTRAINT about_page_locales_pkey PRIMARY KEY (id);


--
-- Name: about_page about_page_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.about_page
    ADD CONSTRAINT about_page_pkey PRIMARY KEY (id);


--
-- Name: booking_settings booking_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_settings
    ADD CONSTRAINT booking_settings_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: cennik_page_locales cennik_page_locales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cennik_page_locales
    ADD CONSTRAINT cennik_page_locales_pkey PRIMARY KEY (id);


--
-- Name: cennik_page cennik_page_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cennik_page
    ADD CONSTRAINT cennik_page_pkey PRIMARY KEY (id);


--
-- Name: contact_page_locales contact_page_locales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_page_locales
    ADD CONSTRAINT contact_page_locales_pkey PRIMARY KEY (id);


--
-- Name: contact_page contact_page_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_page
    ADD CONSTRAINT contact_page_pkey PRIMARY KEY (id);


--
-- Name: faq_items_locales faq_items_locales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faq_items_locales
    ADD CONSTRAINT faq_items_locales_pkey PRIMARY KEY (id);


--
-- Name: faq_items faq_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faq_items
    ADD CONSTRAINT faq_items_pkey PRIMARY KEY (id);


--
-- Name: features_locales features_locales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.features_locales
    ADD CONSTRAINT features_locales_pkey PRIMARY KEY (id);


--
-- Name: features features_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.features
    ADD CONSTRAINT features_pkey PRIMARY KEY (id);


--
-- Name: fleet_vehicles_locales fleet_vehicles_locales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fleet_vehicles_locales
    ADD CONSTRAINT fleet_vehicles_locales_pkey PRIMARY KEY (id);


--
-- Name: fleet_vehicles fleet_vehicles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fleet_vehicles
    ADD CONSTRAINT fleet_vehicles_pkey PRIMARY KEY (id);


--
-- Name: flota_page_equipment_items_locales flota_page_equipment_items_locales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flota_page_equipment_items_locales
    ADD CONSTRAINT flota_page_equipment_items_locales_pkey PRIMARY KEY (id);


--
-- Name: flota_page_equipment_items flota_page_equipment_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flota_page_equipment_items
    ADD CONSTRAINT flota_page_equipment_items_pkey PRIMARY KEY (id);


--
-- Name: flota_page_locales flota_page_locales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flota_page_locales
    ADD CONSTRAINT flota_page_locales_pkey PRIMARY KEY (id);


--
-- Name: flota_page flota_page_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flota_page
    ADD CONSTRAINT flota_page_pkey PRIMARY KEY (id);


--
-- Name: gallery_items_locales gallery_items_locales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gallery_items_locales
    ADD CONSTRAINT gallery_items_locales_pkey PRIMARY KEY (id);


--
-- Name: gallery_items gallery_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gallery_items
    ADD CONSTRAINT gallery_items_pkey PRIMARY KEY (id);


--
-- Name: home_page_hero_badges_locales home_page_hero_badges_locales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.home_page_hero_badges_locales
    ADD CONSTRAINT home_page_hero_badges_locales_pkey PRIMARY KEY (id);


--
-- Name: home_page_hero_badges home_page_hero_badges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.home_page_hero_badges
    ADD CONSTRAINT home_page_hero_badges_pkey PRIMARY KEY (id);


--
-- Name: home_page_hero_booking_panel_steps_locales home_page_hero_booking_panel_steps_locales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.home_page_hero_booking_panel_steps_locales
    ADD CONSTRAINT home_page_hero_booking_panel_steps_locales_pkey PRIMARY KEY (id);


--
-- Name: home_page_hero_booking_panel_steps home_page_hero_booking_panel_steps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.home_page_hero_booking_panel_steps
    ADD CONSTRAINT home_page_hero_booking_panel_steps_pkey PRIMARY KEY (id);


--
-- Name: home_page_hero_stats_locales home_page_hero_stats_locales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.home_page_hero_stats_locales
    ADD CONSTRAINT home_page_hero_stats_locales_pkey PRIMARY KEY (id);


--
-- Name: home_page_hero_stats home_page_hero_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.home_page_hero_stats
    ADD CONSTRAINT home_page_hero_stats_pkey PRIMARY KEY (id);


--
-- Name: home_page_locales home_page_locales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.home_page_locales
    ADD CONSTRAINT home_page_locales_pkey PRIMARY KEY (id);


--
-- Name: home_page_marquee_phrases_locales home_page_marquee_phrases_locales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.home_page_marquee_phrases_locales
    ADD CONSTRAINT home_page_marquee_phrases_locales_pkey PRIMARY KEY (id);


--
-- Name: home_page_marquee_phrases home_page_marquee_phrases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.home_page_marquee_phrases
    ADD CONSTRAINT home_page_marquee_phrases_pkey PRIMARY KEY (id);


--
-- Name: home_page home_page_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.home_page
    ADD CONSTRAINT home_page_pkey PRIMARY KEY (id);


--
-- Name: media media_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_pkey PRIMARY KEY (id);


--
-- Name: news_posts_locales news_posts_locales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.news_posts_locales
    ADD CONSTRAINT news_posts_locales_pkey PRIMARY KEY (id);


--
-- Name: news_posts news_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.news_posts
    ADD CONSTRAINT news_posts_pkey PRIMARY KEY (id);


--
-- Name: payload_kv payload_kv_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_kv
    ADD CONSTRAINT payload_kv_pkey PRIMARY KEY (id);


--
-- Name: payload_locked_documents payload_locked_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents
    ADD CONSTRAINT payload_locked_documents_pkey PRIMARY KEY (id);


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_pkey PRIMARY KEY (id);


--
-- Name: payload_migrations payload_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_migrations
    ADD CONSTRAINT payload_migrations_pkey PRIMARY KEY (id);


--
-- Name: payload_preferences payload_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_preferences
    ADD CONSTRAINT payload_preferences_pkey PRIMARY KEY (id);


--
-- Name: payload_preferences_rels payload_preferences_rels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_preferences_rels
    ADD CONSTRAINT payload_preferences_rels_pkey PRIMARY KEY (id);


--
-- Name: process_steps_locales process_steps_locales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.process_steps_locales
    ADD CONSTRAINT process_steps_locales_pkey PRIMARY KEY (id);


--
-- Name: process_steps process_steps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.process_steps
    ADD CONSTRAINT process_steps_pkey PRIMARY KEY (id);


--
-- Name: reviews_locales reviews_locales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews_locales
    ADD CONSTRAINT reviews_locales_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: site_settings_locales site_settings_locales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings_locales
    ADD CONSTRAINT site_settings_locales_pkey PRIMARY KEY (id);


--
-- Name: site_settings_phones site_settings_phones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings_phones
    ADD CONSTRAINT site_settings_phones_pkey PRIMARY KEY (id);


--
-- Name: site_settings site_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_pkey PRIMARY KEY (id);


--
-- Name: tour_routes_locales tour_routes_locales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_routes_locales
    ADD CONSTRAINT tour_routes_locales_pkey PRIMARY KEY (id);


--
-- Name: tour_routes tour_routes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_routes
    ADD CONSTRAINT tour_routes_pkey PRIMARY KEY (id);


--
-- Name: trasy_page_extra_blocks_locales trasy_page_extra_blocks_locales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trasy_page_extra_blocks_locales
    ADD CONSTRAINT trasy_page_extra_blocks_locales_pkey PRIMARY KEY (id);


--
-- Name: trasy_page_extra_blocks trasy_page_extra_blocks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trasy_page_extra_blocks
    ADD CONSTRAINT trasy_page_extra_blocks_pkey PRIMARY KEY (id);


--
-- Name: trasy_page_locales trasy_page_locales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trasy_page_locales
    ADD CONSTRAINT trasy_page_locales_pkey PRIMARY KEY (id);


--
-- Name: trasy_page trasy_page_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trasy_page
    ADD CONSTRAINT trasy_page_pkey PRIMARY KEY (id);


--
-- Name: trips trips_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users_sessions users_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_sessions
    ADD CONSTRAINT users_sessions_pkey PRIMARY KEY (id);


--
-- Name: about_page_locales_locale_parent_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX about_page_locales_locale_parent_id_unique ON public.about_page_locales USING btree (_locale, _parent_id);


--
-- Name: about_page_seo_seo_image_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX about_page_seo_seo_image_idx ON public.about_page USING btree (seo_image_id);


--
-- Name: bookings_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX bookings_created_at_idx ON public.bookings USING btree (created_at);


--
-- Name: bookings_trip_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX bookings_trip_idx ON public.bookings USING btree (trip_id);


--
-- Name: bookings_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX bookings_updated_at_idx ON public.bookings USING btree (updated_at);


--
-- Name: cennik_page_locales_locale_parent_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX cennik_page_locales_locale_parent_id_unique ON public.cennik_page_locales USING btree (_locale, _parent_id);


--
-- Name: cennik_page_seo_seo_image_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cennik_page_seo_seo_image_idx ON public.cennik_page USING btree (seo_image_id);


--
-- Name: contact_page_locales_locale_parent_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX contact_page_locales_locale_parent_id_unique ON public.contact_page_locales USING btree (_locale, _parent_id);


--
-- Name: contact_page_seo_seo_image_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX contact_page_seo_seo_image_idx ON public.contact_page USING btree (seo_image_id);


--
-- Name: faq_items_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX faq_items_created_at_idx ON public.faq_items USING btree (created_at);


--
-- Name: faq_items_locales_locale_parent_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX faq_items_locales_locale_parent_id_unique ON public.faq_items_locales USING btree (_locale, _parent_id);


--
-- Name: faq_items_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX faq_items_updated_at_idx ON public.faq_items USING btree (updated_at);


--
-- Name: features_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX features_created_at_idx ON public.features USING btree (created_at);


--
-- Name: features_locales_locale_parent_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX features_locales_locale_parent_id_unique ON public.features_locales USING btree (_locale, _parent_id);


--
-- Name: features_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX features_updated_at_idx ON public.features USING btree (updated_at);


--
-- Name: fleet_vehicles_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX fleet_vehicles_created_at_idx ON public.fleet_vehicles USING btree (created_at);


--
-- Name: fleet_vehicles_image_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX fleet_vehicles_image_idx ON public.fleet_vehicles USING btree (image_id);


--
-- Name: fleet_vehicles_locales_locale_parent_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX fleet_vehicles_locales_locale_parent_id_unique ON public.fleet_vehicles_locales USING btree (_locale, _parent_id);


--
-- Name: fleet_vehicles_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX fleet_vehicles_updated_at_idx ON public.fleet_vehicles USING btree (updated_at);


--
-- Name: flota_page_equipment_items_locales_locale_parent_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX flota_page_equipment_items_locales_locale_parent_id_unique ON public.flota_page_equipment_items_locales USING btree (_locale, _parent_id);


--
-- Name: flota_page_equipment_items_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX flota_page_equipment_items_order_idx ON public.flota_page_equipment_items USING btree (_order);


--
-- Name: flota_page_equipment_items_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX flota_page_equipment_items_parent_id_idx ON public.flota_page_equipment_items USING btree (_parent_id);


--
-- Name: flota_page_locales_locale_parent_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX flota_page_locales_locale_parent_id_unique ON public.flota_page_locales USING btree (_locale, _parent_id);


--
-- Name: flota_page_seo_seo_image_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX flota_page_seo_seo_image_idx ON public.flota_page USING btree (seo_image_id);


--
-- Name: gallery_items_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX gallery_items_created_at_idx ON public.gallery_items USING btree (created_at);


--
-- Name: gallery_items_image_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX gallery_items_image_idx ON public.gallery_items USING btree (image_id);


--
-- Name: gallery_items_locales_locale_parent_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX gallery_items_locales_locale_parent_id_unique ON public.gallery_items_locales USING btree (_locale, _parent_id);


--
-- Name: gallery_items_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX gallery_items_updated_at_idx ON public.gallery_items USING btree (updated_at);


--
-- Name: home_page_cta_banner_cta_banner_bg_image_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX home_page_cta_banner_cta_banner_bg_image_idx ON public.home_page USING btree (cta_banner_bg_image_id);


--
-- Name: home_page_hero_badges_locales_locale_parent_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX home_page_hero_badges_locales_locale_parent_id_unique ON public.home_page_hero_badges_locales USING btree (_locale, _parent_id);


--
-- Name: home_page_hero_badges_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX home_page_hero_badges_order_idx ON public.home_page_hero_badges USING btree (_order);


--
-- Name: home_page_hero_badges_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX home_page_hero_badges_parent_id_idx ON public.home_page_hero_badges USING btree (_parent_id);


--
-- Name: home_page_hero_booking_panel_steps_locales_locale_parent_id_; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX home_page_hero_booking_panel_steps_locales_locale_parent_id_ ON public.home_page_hero_booking_panel_steps_locales USING btree (_locale, _parent_id);


--
-- Name: home_page_hero_booking_panel_steps_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX home_page_hero_booking_panel_steps_order_idx ON public.home_page_hero_booking_panel_steps USING btree (_order);


--
-- Name: home_page_hero_booking_panel_steps_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX home_page_hero_booking_panel_steps_parent_id_idx ON public.home_page_hero_booking_panel_steps USING btree (_parent_id);


--
-- Name: home_page_hero_hero_bg_image_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX home_page_hero_hero_bg_image_idx ON public.home_page USING btree (hero_bg_image_id);


--
-- Name: home_page_hero_hero_video_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX home_page_hero_hero_video_idx ON public.home_page USING btree (hero_video_id);


--
-- Name: home_page_hero_stats_locales_locale_parent_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX home_page_hero_stats_locales_locale_parent_id_unique ON public.home_page_hero_stats_locales USING btree (_locale, _parent_id);


--
-- Name: home_page_hero_stats_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX home_page_hero_stats_order_idx ON public.home_page_hero_stats USING btree (_order);


--
-- Name: home_page_hero_stats_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX home_page_hero_stats_parent_id_idx ON public.home_page_hero_stats USING btree (_parent_id);


--
-- Name: home_page_locales_locale_parent_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX home_page_locales_locale_parent_id_unique ON public.home_page_locales USING btree (_locale, _parent_id);


--
-- Name: home_page_marquee_phrases_locales_locale_parent_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX home_page_marquee_phrases_locales_locale_parent_id_unique ON public.home_page_marquee_phrases_locales USING btree (_locale, _parent_id);


--
-- Name: home_page_marquee_phrases_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX home_page_marquee_phrases_order_idx ON public.home_page_marquee_phrases USING btree (_order);


--
-- Name: home_page_marquee_phrases_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX home_page_marquee_phrases_parent_id_idx ON public.home_page_marquee_phrases USING btree (_parent_id);


--
-- Name: home_page_seo_seo_image_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX home_page_seo_seo_image_idx ON public.home_page USING btree (seo_image_id);


--
-- Name: media_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX media_created_at_idx ON public.media USING btree (created_at);


--
-- Name: media_filename_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX media_filename_idx ON public.media USING btree (filename);


--
-- Name: media_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX media_updated_at_idx ON public.media USING btree (updated_at);


--
-- Name: news_posts_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX news_posts_created_at_idx ON public.news_posts USING btree (created_at);


--
-- Name: news_posts_image_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX news_posts_image_idx ON public.news_posts USING btree (image_id);


--
-- Name: news_posts_locales_locale_parent_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX news_posts_locales_locale_parent_id_unique ON public.news_posts_locales USING btree (_locale, _parent_id);


--
-- Name: news_posts_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX news_posts_slug_idx ON public.news_posts USING btree (slug);


--
-- Name: news_posts_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX news_posts_updated_at_idx ON public.news_posts USING btree (updated_at);


--
-- Name: payload_kv_key_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX payload_kv_key_idx ON public.payload_kv USING btree (key);


--
-- Name: payload_locked_documents_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_created_at_idx ON public.payload_locked_documents USING btree (created_at);


--
-- Name: payload_locked_documents_global_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_global_slug_idx ON public.payload_locked_documents USING btree (global_slug);


--
-- Name: payload_locked_documents_rels_bookings_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_bookings_id_idx ON public.payload_locked_documents_rels USING btree (bookings_id);


--
-- Name: payload_locked_documents_rels_faq_items_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_faq_items_id_idx ON public.payload_locked_documents_rels USING btree (faq_items_id);


--
-- Name: payload_locked_documents_rels_features_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_features_id_idx ON public.payload_locked_documents_rels USING btree (features_id);


--
-- Name: payload_locked_documents_rels_fleet_vehicles_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_fleet_vehicles_id_idx ON public.payload_locked_documents_rels USING btree (fleet_vehicles_id);


--
-- Name: payload_locked_documents_rels_gallery_items_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_gallery_items_id_idx ON public.payload_locked_documents_rels USING btree (gallery_items_id);


--
-- Name: payload_locked_documents_rels_media_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_media_id_idx ON public.payload_locked_documents_rels USING btree (media_id);


--
-- Name: payload_locked_documents_rels_news_posts_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_news_posts_id_idx ON public.payload_locked_documents_rels USING btree (news_posts_id);


--
-- Name: payload_locked_documents_rels_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_order_idx ON public.payload_locked_documents_rels USING btree ("order");


--
-- Name: payload_locked_documents_rels_parent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_parent_idx ON public.payload_locked_documents_rels USING btree (parent_id);


--
-- Name: payload_locked_documents_rels_path_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_path_idx ON public.payload_locked_documents_rels USING btree (path);


--
-- Name: payload_locked_documents_rels_process_steps_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_process_steps_id_idx ON public.payload_locked_documents_rels USING btree (process_steps_id);


--
-- Name: payload_locked_documents_rels_reviews_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_reviews_id_idx ON public.payload_locked_documents_rels USING btree (reviews_id);


--
-- Name: payload_locked_documents_rels_tour_routes_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_tour_routes_id_idx ON public.payload_locked_documents_rels USING btree (tour_routes_id);


--
-- Name: payload_locked_documents_rels_trips_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_trips_id_idx ON public.payload_locked_documents_rels USING btree (trips_id);


--
-- Name: payload_locked_documents_rels_users_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_users_id_idx ON public.payload_locked_documents_rels USING btree (users_id);


--
-- Name: payload_locked_documents_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_updated_at_idx ON public.payload_locked_documents USING btree (updated_at);


--
-- Name: payload_migrations_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_migrations_created_at_idx ON public.payload_migrations USING btree (created_at);


--
-- Name: payload_migrations_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_migrations_updated_at_idx ON public.payload_migrations USING btree (updated_at);


--
-- Name: payload_preferences_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_preferences_created_at_idx ON public.payload_preferences USING btree (created_at);


--
-- Name: payload_preferences_key_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_preferences_key_idx ON public.payload_preferences USING btree (key);


--
-- Name: payload_preferences_rels_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_preferences_rels_order_idx ON public.payload_preferences_rels USING btree ("order");


--
-- Name: payload_preferences_rels_parent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_preferences_rels_parent_idx ON public.payload_preferences_rels USING btree (parent_id);


--
-- Name: payload_preferences_rels_path_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_preferences_rels_path_idx ON public.payload_preferences_rels USING btree (path);


--
-- Name: payload_preferences_rels_users_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_preferences_rels_users_id_idx ON public.payload_preferences_rels USING btree (users_id);


--
-- Name: payload_preferences_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_preferences_updated_at_idx ON public.payload_preferences USING btree (updated_at);


--
-- Name: process_steps_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX process_steps_created_at_idx ON public.process_steps USING btree (created_at);


--
-- Name: process_steps_locales_locale_parent_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX process_steps_locales_locale_parent_id_unique ON public.process_steps_locales USING btree (_locale, _parent_id);


--
-- Name: process_steps_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX process_steps_updated_at_idx ON public.process_steps USING btree (updated_at);


--
-- Name: reviews_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reviews_created_at_idx ON public.reviews USING btree (created_at);


--
-- Name: reviews_locales_locale_parent_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX reviews_locales_locale_parent_id_unique ON public.reviews_locales USING btree (_locale, _parent_id);


--
-- Name: reviews_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reviews_updated_at_idx ON public.reviews USING btree (updated_at);


--
-- Name: site_settings_locales_locale_parent_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX site_settings_locales_locale_parent_id_unique ON public.site_settings_locales USING btree (_locale, _parent_id);


--
-- Name: site_settings_phones_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX site_settings_phones_order_idx ON public.site_settings_phones USING btree (_order);


--
-- Name: site_settings_phones_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX site_settings_phones_parent_id_idx ON public.site_settings_phones USING btree (_parent_id);


--
-- Name: tour_routes_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tour_routes_created_at_idx ON public.tour_routes USING btree (created_at);


--
-- Name: tour_routes_image_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tour_routes_image_idx ON public.tour_routes USING btree (image_id);


--
-- Name: tour_routes_locales_locale_parent_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX tour_routes_locales_locale_parent_id_unique ON public.tour_routes_locales USING btree (_locale, _parent_id);


--
-- Name: tour_routes_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tour_routes_updated_at_idx ON public.tour_routes USING btree (updated_at);


--
-- Name: trasy_page_extra_blocks_image_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX trasy_page_extra_blocks_image_idx ON public.trasy_page_extra_blocks USING btree (image_id);


--
-- Name: trasy_page_extra_blocks_locales_locale_parent_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX trasy_page_extra_blocks_locales_locale_parent_id_unique ON public.trasy_page_extra_blocks_locales USING btree (_locale, _parent_id);


--
-- Name: trasy_page_extra_blocks_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX trasy_page_extra_blocks_order_idx ON public.trasy_page_extra_blocks USING btree (_order);


--
-- Name: trasy_page_extra_blocks_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX trasy_page_extra_blocks_parent_id_idx ON public.trasy_page_extra_blocks USING btree (_parent_id);


--
-- Name: trasy_page_locales_locale_parent_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX trasy_page_locales_locale_parent_id_unique ON public.trasy_page_locales USING btree (_locale, _parent_id);


--
-- Name: trasy_page_seo_seo_image_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX trasy_page_seo_seo_image_idx ON public.trasy_page USING btree (seo_image_id);


--
-- Name: trips_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX trips_created_at_idx ON public.trips USING btree (created_at);


--
-- Name: trips_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX trips_updated_at_idx ON public.trips USING btree (updated_at);


--
-- Name: users_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_created_at_idx ON public.users USING btree (created_at);


--
-- Name: users_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_idx ON public.users USING btree (email);


--
-- Name: users_sessions_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_sessions_order_idx ON public.users_sessions USING btree (_order);


--
-- Name: users_sessions_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_sessions_parent_id_idx ON public.users_sessions USING btree (_parent_id);


--
-- Name: users_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_updated_at_idx ON public.users USING btree (updated_at);


--
-- Name: about_page_locales about_page_locales_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.about_page_locales
    ADD CONSTRAINT about_page_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.about_page(id) ON DELETE CASCADE;


--
-- Name: about_page about_page_seo_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.about_page
    ADD CONSTRAINT about_page_seo_image_id_media_id_fk FOREIGN KEY (seo_image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: bookings bookings_trip_id_trips_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_trip_id_trips_id_fk FOREIGN KEY (trip_id) REFERENCES public.trips(id) ON DELETE SET NULL;


--
-- Name: cennik_page_locales cennik_page_locales_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cennik_page_locales
    ADD CONSTRAINT cennik_page_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.cennik_page(id) ON DELETE CASCADE;


--
-- Name: cennik_page cennik_page_seo_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cennik_page
    ADD CONSTRAINT cennik_page_seo_image_id_media_id_fk FOREIGN KEY (seo_image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: contact_page_locales contact_page_locales_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_page_locales
    ADD CONSTRAINT contact_page_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.contact_page(id) ON DELETE CASCADE;


--
-- Name: contact_page contact_page_seo_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_page
    ADD CONSTRAINT contact_page_seo_image_id_media_id_fk FOREIGN KEY (seo_image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: faq_items_locales faq_items_locales_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faq_items_locales
    ADD CONSTRAINT faq_items_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.faq_items(id) ON DELETE CASCADE;


--
-- Name: features_locales features_locales_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.features_locales
    ADD CONSTRAINT features_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.features(id) ON DELETE CASCADE;


--
-- Name: fleet_vehicles fleet_vehicles_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fleet_vehicles
    ADD CONSTRAINT fleet_vehicles_image_id_media_id_fk FOREIGN KEY (image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: fleet_vehicles_locales fleet_vehicles_locales_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fleet_vehicles_locales
    ADD CONSTRAINT fleet_vehicles_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.fleet_vehicles(id) ON DELETE CASCADE;


--
-- Name: flota_page_equipment_items_locales flota_page_equipment_items_locales_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flota_page_equipment_items_locales
    ADD CONSTRAINT flota_page_equipment_items_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.flota_page_equipment_items(id) ON DELETE CASCADE;


--
-- Name: flota_page_equipment_items flota_page_equipment_items_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flota_page_equipment_items
    ADD CONSTRAINT flota_page_equipment_items_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.flota_page(id) ON DELETE CASCADE;


--
-- Name: flota_page_locales flota_page_locales_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flota_page_locales
    ADD CONSTRAINT flota_page_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.flota_page(id) ON DELETE CASCADE;


--
-- Name: flota_page flota_page_seo_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flota_page
    ADD CONSTRAINT flota_page_seo_image_id_media_id_fk FOREIGN KEY (seo_image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: gallery_items gallery_items_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gallery_items
    ADD CONSTRAINT gallery_items_image_id_media_id_fk FOREIGN KEY (image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: gallery_items_locales gallery_items_locales_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gallery_items_locales
    ADD CONSTRAINT gallery_items_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.gallery_items(id) ON DELETE CASCADE;


--
-- Name: home_page home_page_cta_banner_bg_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.home_page
    ADD CONSTRAINT home_page_cta_banner_bg_image_id_media_id_fk FOREIGN KEY (cta_banner_bg_image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: home_page_hero_badges_locales home_page_hero_badges_locales_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.home_page_hero_badges_locales
    ADD CONSTRAINT home_page_hero_badges_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.home_page_hero_badges(id) ON DELETE CASCADE;


--
-- Name: home_page_hero_badges home_page_hero_badges_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.home_page_hero_badges
    ADD CONSTRAINT home_page_hero_badges_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.home_page(id) ON DELETE CASCADE;


--
-- Name: home_page home_page_hero_bg_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.home_page
    ADD CONSTRAINT home_page_hero_bg_image_id_media_id_fk FOREIGN KEY (hero_bg_image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: home_page_hero_booking_panel_steps_locales home_page_hero_booking_panel_steps_locales_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.home_page_hero_booking_panel_steps_locales
    ADD CONSTRAINT home_page_hero_booking_panel_steps_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.home_page_hero_booking_panel_steps(id) ON DELETE CASCADE;


--
-- Name: home_page_hero_booking_panel_steps home_page_hero_booking_panel_steps_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.home_page_hero_booking_panel_steps
    ADD CONSTRAINT home_page_hero_booking_panel_steps_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.home_page(id) ON DELETE CASCADE;


--
-- Name: home_page_hero_stats_locales home_page_hero_stats_locales_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.home_page_hero_stats_locales
    ADD CONSTRAINT home_page_hero_stats_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.home_page_hero_stats(id) ON DELETE CASCADE;


--
-- Name: home_page_hero_stats home_page_hero_stats_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.home_page_hero_stats
    ADD CONSTRAINT home_page_hero_stats_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.home_page(id) ON DELETE CASCADE;


--
-- Name: home_page home_page_hero_video_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.home_page
    ADD CONSTRAINT home_page_hero_video_id_media_id_fk FOREIGN KEY (hero_video_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: home_page_locales home_page_locales_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.home_page_locales
    ADD CONSTRAINT home_page_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.home_page(id) ON DELETE CASCADE;


--
-- Name: home_page_marquee_phrases_locales home_page_marquee_phrases_locales_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.home_page_marquee_phrases_locales
    ADD CONSTRAINT home_page_marquee_phrases_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.home_page_marquee_phrases(id) ON DELETE CASCADE;


--
-- Name: home_page_marquee_phrases home_page_marquee_phrases_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.home_page_marquee_phrases
    ADD CONSTRAINT home_page_marquee_phrases_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.home_page(id) ON DELETE CASCADE;


--
-- Name: home_page home_page_seo_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.home_page
    ADD CONSTRAINT home_page_seo_image_id_media_id_fk FOREIGN KEY (seo_image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: news_posts news_posts_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.news_posts
    ADD CONSTRAINT news_posts_image_id_media_id_fk FOREIGN KEY (image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: news_posts_locales news_posts_locales_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.news_posts_locales
    ADD CONSTRAINT news_posts_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.news_posts(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_bookings_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_bookings_fk FOREIGN KEY (bookings_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_faq_items_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_faq_items_fk FOREIGN KEY (faq_items_id) REFERENCES public.faq_items(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_features_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_features_fk FOREIGN KEY (features_id) REFERENCES public.features(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_fleet_vehicles_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_fleet_vehicles_fk FOREIGN KEY (fleet_vehicles_id) REFERENCES public.fleet_vehicles(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_gallery_items_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_gallery_items_fk FOREIGN KEY (gallery_items_id) REFERENCES public.gallery_items(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_media_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_media_fk FOREIGN KEY (media_id) REFERENCES public.media(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_news_posts_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_news_posts_fk FOREIGN KEY (news_posts_id) REFERENCES public.news_posts(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_parent_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_parent_fk FOREIGN KEY (parent_id) REFERENCES public.payload_locked_documents(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_process_steps_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_process_steps_fk FOREIGN KEY (process_steps_id) REFERENCES public.process_steps(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_reviews_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_reviews_fk FOREIGN KEY (reviews_id) REFERENCES public.reviews(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_tour_routes_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_tour_routes_fk FOREIGN KEY (tour_routes_id) REFERENCES public.tour_routes(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_trips_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_trips_fk FOREIGN KEY (trips_id) REFERENCES public.trips(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_users_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_users_fk FOREIGN KEY (users_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: payload_preferences_rels payload_preferences_rels_parent_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_preferences_rels
    ADD CONSTRAINT payload_preferences_rels_parent_fk FOREIGN KEY (parent_id) REFERENCES public.payload_preferences(id) ON DELETE CASCADE;


--
-- Name: payload_preferences_rels payload_preferences_rels_users_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_preferences_rels
    ADD CONSTRAINT payload_preferences_rels_users_fk FOREIGN KEY (users_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: process_steps_locales process_steps_locales_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.process_steps_locales
    ADD CONSTRAINT process_steps_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.process_steps(id) ON DELETE CASCADE;


--
-- Name: reviews_locales reviews_locales_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews_locales
    ADD CONSTRAINT reviews_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.reviews(id) ON DELETE CASCADE;


--
-- Name: site_settings_locales site_settings_locales_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings_locales
    ADD CONSTRAINT site_settings_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.site_settings(id) ON DELETE CASCADE;


--
-- Name: site_settings_phones site_settings_phones_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings_phones
    ADD CONSTRAINT site_settings_phones_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.site_settings(id) ON DELETE CASCADE;


--
-- Name: tour_routes tour_routes_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_routes
    ADD CONSTRAINT tour_routes_image_id_media_id_fk FOREIGN KEY (image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: tour_routes_locales tour_routes_locales_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_routes_locales
    ADD CONSTRAINT tour_routes_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.tour_routes(id) ON DELETE CASCADE;


--
-- Name: trasy_page_extra_blocks trasy_page_extra_blocks_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trasy_page_extra_blocks
    ADD CONSTRAINT trasy_page_extra_blocks_image_id_media_id_fk FOREIGN KEY (image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: trasy_page_extra_blocks_locales trasy_page_extra_blocks_locales_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trasy_page_extra_blocks_locales
    ADD CONSTRAINT trasy_page_extra_blocks_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.trasy_page_extra_blocks(id) ON DELETE CASCADE;


--
-- Name: trasy_page_extra_blocks trasy_page_extra_blocks_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trasy_page_extra_blocks
    ADD CONSTRAINT trasy_page_extra_blocks_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.trasy_page(id) ON DELETE CASCADE;


--
-- Name: trasy_page_locales trasy_page_locales_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trasy_page_locales
    ADD CONSTRAINT trasy_page_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.trasy_page(id) ON DELETE CASCADE;


--
-- Name: trasy_page trasy_page_seo_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trasy_page
    ADD CONSTRAINT trasy_page_seo_image_id_media_id_fk FOREIGN KEY (seo_image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: users_sessions users_sessions_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_sessions
    ADD CONSTRAINT users_sessions_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--


