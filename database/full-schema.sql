-- =====================================================================
-- Green Bangla Learning Academy — full database setup (new Supabase project)
-- Run once in: Supabase Dashboard → SQL Editor → New query → Run
-- =====================================================================

-- ---------- Roles & profiles ----------
CREATE TYPE public.app_role AS ENUM ('admin','moderator','user');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.profiles FOR ALL TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- New auth user -> profile row
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- First account ever becomes admin, later ones become 'user'
CREATE OR REPLACE FUNCTION public.bootstrap_first_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.bootstrap_first_admin() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER on_profile_created_assign_role AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.bootstrap_first_admin();

-- ---------- Categories ----------
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name_bn text NOT NULL,
  name_en text NOT NULL,
  description_bn text,
  description_en text,
  color text NOT NULL DEFAULT '#2D8659',
  bg_color text NOT NULL DEFAULT '#E8F5E9',
  icon text NOT NULL DEFAULT 'BookOpen',
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read categories" ON public.categories FOR SELECT TO anon, authenticated USING (is_active);
CREATE POLICY "admins manage categories" ON public.categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER t_categories_updated BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------- Instructors ----------
CREATE TABLE public.instructors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_bn text NOT NULL,
  name_en text NOT NULL,
  title_bn text,
  title_en text,
  bio_bn text,
  bio_en text,
  photo_url text,
  email text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.instructors TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.instructors TO authenticated;
GRANT ALL ON public.instructors TO service_role;
ALTER TABLE public.instructors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read instructors" ON public.instructors FOR SELECT TO anon, authenticated USING (is_active);
CREATE POLICY "admins manage instructors" ON public.instructors FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER t_instructors_updated BEFORE UPDATE ON public.instructors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------- Courses ----------
CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  instructor_id uuid REFERENCES public.instructors(id) ON DELETE SET NULL,
  title_bn text NOT NULL,
  title_en text NOT NULL,
  short_description_bn text,
  short_description_en text,
  description_bn text,
  description_en text,
  image_url text,
  duration_bn text,
  duration_en text,
  total_classes int NOT NULL DEFAULT 0,
  level_bn text,
  level_en text,
  fee numeric(10,2) NOT NULL DEFAULT 0,
  is_free boolean NOT NULL DEFAULT false,
  is_scholarship boolean NOT NULL DEFAULT false,
  is_featured boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT true,
  seo_title text,
  seo_description text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.courses TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.courses TO authenticated;
GRANT ALL ON public.courses TO service_role;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read courses" ON public.courses FOR SELECT TO anon, authenticated USING (is_published);
CREATE POLICY "admins manage courses" ON public.courses FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER t_courses_updated BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------- Curriculum & outcomes ----------
CREATE TABLE public.curriculum_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title_bn text NOT NULL,
  title_en text,
  description_bn text,
  description_en text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.curriculum_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.curriculum_items TO authenticated;
GRANT ALL ON public.curriculum_items TO service_role;
ALTER TABLE public.curriculum_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read curriculum" ON public.curriculum_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage curriculum" ON public.curriculum_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.learning_outcomes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  text_bn text NOT NULL,
  text_en text,
  sort_order int NOT NULL DEFAULT 0
);
GRANT SELECT ON public.learning_outcomes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.learning_outcomes TO authenticated;
GRANT ALL ON public.learning_outcomes TO service_role;
ALTER TABLE public.learning_outcomes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read outcomes" ON public.learning_outcomes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage outcomes" ON public.learning_outcomes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ---------- Applications ----------
CREATE TYPE public.application_status AS ENUM ('pending','approved','rejected','enrolled');

CREATE TABLE public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_code text NOT NULL UNIQUE DEFAULT upper(substr(replace(gen_random_uuid()::text,'-',''),1,10)),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE RESTRICT,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  address text,
  education text,
  message text,
  status public.application_status NOT NULL DEFAULT 'pending',
  admin_notes text,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
-- No direct INSERT for anon: public submits through submit_application()
GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins insert applications" ON public.applications FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins read applications" ON public.applications FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins update applications" ON public.applications FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins delete applications" ON public.applications FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER t_applications_updated BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.submit_application(
  _course_id uuid,
  _full_name text,
  _email text,
  _phone text,
  _address text DEFAULT NULL,
  _education text DEFAULT NULL,
  _message text DEFAULT NULL
)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _ref text;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.courses WHERE id = _course_id AND is_published) THEN
    RAISE EXCEPTION 'Invalid course';
  END IF;

  IF coalesce(length(trim(_full_name)), 0) = 0
     OR coalesce(length(trim(_phone)), 0) < 6
     OR coalesce(trim(_email), '') !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RAISE EXCEPTION 'Invalid input';
  END IF;

  INSERT INTO public.applications (course_id, full_name, email, phone, address, education, message)
  VALUES (
    _course_id,
    left(trim(_full_name), 120),
    left(trim(_email), 200),
    left(trim(_phone), 30),
    nullif(left(trim(coalesce(_address, '')), 300), ''),
    nullif(left(trim(coalesce(_education, '')), 200), ''),
    nullif(left(trim(coalesce(_message, '')), 2000), '')
  )
  RETURNING reference_code INTO _ref;

  RETURN _ref;
END; $$;
REVOKE ALL ON FUNCTION public.submit_application(uuid, text, text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_application(uuid, text, text, text, text, text, text) TO anon, authenticated;

-- ---------- Payments ----------
CREATE TYPE public.payment_status AS ENUM ('pending','submitted','paid','failed','waived');

CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL UNIQUE REFERENCES public.applications(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  method text,
  transaction_ref text,
  status public.payment_status NOT NULL DEFAULT 'pending',
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage payments" ON public.payments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER t_payments_updated BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------- Site settings ----------
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text NOT NULL DEFAULT '',
  group_name text NOT NULL DEFAULT 'general',
  label text NOT NULL DEFAULT '',
  input_type text NOT NULL DEFAULT 'text',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read site settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage site settings" ON public.site_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER t_site_settings_updated BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.site_settings (key, value, group_name, label, input_type, sort_order) VALUES
  ('site_name', 'Green Bangla Learning Academy', 'general', 'সাইটের নাম', 'text', 1),
  ('site_tagline', 'কুরআন, ব্যবসা এবং ব্যক্তিগত উন্নয়নে মানসম্মত শিক্ষা — সবার জন্য, সহজে।', 'general', 'সাইটের সংক্ষিপ্ত পরিচিতি', 'textarea', 2),
  ('hero_banner_image', '', 'hero', 'হিরো ব্যানার ছবি', 'image', 0),
  ('hero_badge', 'নতুন ব্যাচে ভর্তি চলছে', 'hero', 'হিরো ব্যাজ', 'text', 1),
  ('hero_title', 'শিক্ষায় নতুন দিগন্ত আবিষ্কার করুন', 'hero', 'হিরো শিরোনাম', 'text', 2),
  ('hero_subtitle', 'কুরআন, ব্যবসা এবং ব্যক্তিগত উন্নয়নে প্রয়োজনীয় জ্ঞান ও দক্ষতা অর্জন করুন।', 'hero', 'হিরো বিবরণ', 'textarea', 3),
  ('hero_primary_cta', 'কোর্স দেখুন', 'hero', 'প্রথম বাটনের লেখা', 'text', 4),
  ('hero_secondary_cta', 'আমাদের সম্পর্কে জানুন', 'hero', 'দ্বিতীয় বাটনের লেখা', 'text', 5),
  ('cta_title', 'আজই আবেদন করুন', 'home', 'CTA শিরোনাম', 'text', 1),
  ('cta_text', 'পছন্দের কোর্সে আবেদন জমা দিন। আমাদের টিম যাচাই করে দ্রুত আপনাকে জানাবে।', 'home', 'CTA বিবরণ', 'textarea', 2),
  ('contact_address', 'Middle Alipur, Faridpur', 'contact', 'ঠিকানা', 'text', 1),
  ('contact_email', 'gbsociety80@gmail.com', 'contact', 'ইমেইল', 'text', 2),
  ('contact_phone', '01735-808380', 'contact', 'ফোন নম্বর', 'text', 3),
  ('contact_whatsapp', '01834-757376', 'contact', 'WhatsApp নম্বর (প্রদর্শনের জন্য)', 'text', 4),
  ('contact_whatsapp_intl', '8801834757376', 'contact', 'WhatsApp নম্বর (আন্তর্জাতিক, লিংকের জন্য)', 'text', 5),
  ('contact_facebook', 'https://www.facebook.com/profile.php?id=61565950551214', 'contact', 'Facebook লিংক', 'text', 6),
  ('contact_hours', 'শনি–বৃহস্পতি, সকাল ১০টা – সন্ধ্যা ৭টা', 'contact', 'অফিস সময়', 'text', 7),
  ('contact_intro', 'কোর্স, ভর্তি প্রক্রিয়া কিংবা স্কলারশিপ নিয়ে প্রশ্ন থাকলে জানান — আমরা দ্রুত উত্তর দেব।', 'contact', 'যোগাযোগ পেজের বিবরণ', 'textarea', 8);

-- ---------- Storage bucket for uploaded images ----------
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "public read media" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'media');
CREATE POLICY "admins upload media" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update media" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete media" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));

-- ---------- Starter categories ----------
INSERT INTO public.categories (slug, name_bn, name_en, description_bn, description_en, color, bg_color, icon, sort_order) VALUES
 ('quran-learning','কুরআন শিক্ষা','Quran Learning','সহীহ শুদ্ধ তিলাওয়াত, তাজবীদ ও হিফজ শেখার পূর্ণাঙ্গ প্রোগ্রাম।','Complete programs for correct recitation, tajweed and hifz.','#2D8659','#E8F5E9','BookOpen',1),
 ('business-education','ব্যবসা শিক্ষা','Business Education','উদ্যোক্তা, ই-কমার্স ও ব্যবসা ব্যবস্থাপনার প্রায়োগিক কোর্স।','Practical courses on entrepreneurship, e-commerce and management.','#E67E22','#FFF3E0','Briefcase',2),
 ('personal-development','ব্যক্তিগত উন্নয়ন','Personal Development','যোগাযোগ, নেতৃত্ব ও সময় ব্যবস্থাপনার দক্ষতা বৃদ্ধি।','Grow your communication, leadership and time management skills.','#0288D1','#E1F5FE','Sparkles',3);
