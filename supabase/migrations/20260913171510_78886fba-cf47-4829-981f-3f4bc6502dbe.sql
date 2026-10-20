
-- roles
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
CREATE POLICY "own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

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

CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- categories
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
CREATE POLICY "public read categories" ON public.categories FOR SELECT TO anon, authenticated USING (is_active OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage categories" ON public.categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER t_categories_updated BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- instructors
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
CREATE POLICY "public read instructors" ON public.instructors FOR SELECT TO anon, authenticated USING (is_active OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage instructors" ON public.instructors FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER t_instructors_updated BEFORE UPDATE ON public.instructors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- courses
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
CREATE POLICY "public read courses" ON public.courses FOR SELECT TO anon, authenticated USING (is_published OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage courses" ON public.courses FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER t_courses_updated BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- curriculum
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

-- applications
CREATE TYPE public.application_status AS ENUM ('pending','approved','rejected','enrolled');

CREATE TABLE public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_code text NOT NULL UNIQUE DEFAULT upper(substr(replace(gen_random_uuid()::text,'-',''),1,10)),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
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
GRANT INSERT ON public.applications TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can apply" ON public.applications FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admins read applications" ON public.applications FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins update applications" ON public.applications FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins delete applications" ON public.applications FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER t_applications_updated BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- payments
CREATE TYPE public.payment_status AS ENUM ('pending','submitted','paid','failed','waived');

CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
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
CREATE TRIGGER t_payments_updated BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- seed
INSERT INTO public.categories (slug, name_bn, name_en, description_bn, description_en, color, bg_color, icon, sort_order) VALUES
 ('quran-learning','কুরআন শিক্ষা','Quran Learning','সহীহ শুদ্ধ তিলাওয়াত, তাজবীদ ও হিফজ শেখার পূর্ণাঙ্গ প্রোগ্রাম।','Complete programs for correct recitation, tajweed and hifz.','#2D8659','#E8F5E9','BookOpen',1),
 ('business-education','ব্যবসা শিক্ষা','Business Education','উদ্যোক্তা, ই-কমার্স ও ব্যবসা ব্যবস্থাপনার প্রায়োগিক কোর্স।','Practical courses on entrepreneurship, e-commerce and management.','#E67E22','#FFF3E0','Briefcase',2),
 ('personal-development','ব্যক্তিগত উন্নয়ন','Personal Development','যোগাযোগ, নেতৃত্ব ও সময় ব্যবস্থাপনার দক্ষতা বৃদ্ধি।','Grow your communication, leadership and time management skills.','#0288D1','#E1F5FE','Sparkles',3);

INSERT INTO public.instructors (name_bn, name_en, title_bn, title_en, bio_bn, bio_en, email) VALUES
 ('মাওলানা আব্দুল করিম','Maulana Abdul Karim','কুরআন ও তাজবীদ বিশেষজ্ঞ','Quran & Tajweed Specialist','১৫ বছরের অধিক সময় ধরে কুরআন শিক্ষা দিচ্ছেন। হাফেজ ও ক্বারী।','Teaching Quran for over 15 years. Hafiz and Qari.','karim@greenbangla.com'),
 ('তানভীর হাসান','Tanvir Hasan','ব্যবসা পরামর্শক','Business Consultant','ই-কমার্স ও এসএমই ব্যবসা নিয়ে ১০ বছরের অভিজ্ঞতা।','10 years of experience in e-commerce and SME business.','tanvir@greenbangla.com'),
 ('ডা. নুসরাত জাহান','Dr. Nusrat Jahan','লাইফ স্কিল ট্রেইনার','Life Skill Trainer','ব্যক্তিগত উন্নয়ন ও মানসিক দক্ষতা বিষয়ে প্রশিক্ষক।','Trainer in personal growth and mental skills.','nusrat@greenbangla.com');

INSERT INTO public.courses (slug, category_id, instructor_id, title_bn, title_en, short_description_bn, short_description_en, description_bn, description_en, duration_bn, duration_en, total_classes, level_bn, level_en, fee, is_free, is_scholarship, is_featured, sort_order, seo_title, seo_description)
SELECT 'noorani-qaida', c.id, i.id,
 'নূরানী কায়েদা — শুদ্ধ উচ্চারণ শিক্ষা','Noorani Qaida — Correct Pronunciation',
 'একদম শুরু থেকে আরবি হরফ ও শুদ্ধ উচ্চারণ শিখুন।','Learn Arabic letters and correct pronunciation from scratch.',
 'নূরানী কায়েদার মাধ্যমে আরবি বর্ণমালা, হরকত, মাদ ও শুদ্ধ উচ্চারণের ভিত্তি তৈরি হবে। প্রতিটি ক্লাসে ব্যক্তিগত অনুশীলন ও সংশোধনের সুযোগ থাকবে।','Build your foundation in Arabic letters, harakat, madd and correct pronunciation with personal practice in every class.',
 '৩ মাস','3 months',36,'শিক্ষানবিস','Beginner',0,true,false,true,1,
 'নূরানী কায়েদা কোর্স | Green Bangla Learning Academy','অনলাইনে নূরানী কায়েদা শিখুন — শুদ্ধ উচ্চারণ, তাজবীদের ভিত্তি, অভিজ্ঞ শিক্ষকের তত্ত্বাবধানে।'
FROM public.categories c, public.instructors i WHERE c.slug='quran-learning' AND i.name_en='Maulana Abdul Karim';

INSERT INTO public.courses (slug, category_id, instructor_id, title_bn, title_en, short_description_bn, short_description_en, description_bn, description_en, duration_bn, duration_en, total_classes, level_bn, level_en, fee, is_featured, sort_order, seo_title, seo_description)
SELECT 'tajweed-mastery', c.id, i.id,
 'তাজবীদ মাস্টারি','Tajweed Mastery',
 'তাজবীদের নিয়ম অনুসারে সহীহ তিলাওয়াত আয়ত্ত করুন।','Master recitation with proper tajweed rules.',
 'মাখরাজ, সিফাত, গুন্নাহ, ইদগাম সহ তাজবীদের সকল মৌলিক নিয়ম প্রায়োগিকভাবে শেখানো হবে।','Learn makhraj, sifat, ghunnah, idgham and all core tajweed rules with practical application.',
 '৬ মাস','6 months',72,'মধ্যম','Intermediate',2500,true,2,
 'তাজবীদ কোর্স | Green Bangla Learning Academy','তাজবীদের নিয়ম শিখে সহীহ কুরআন তিলাওয়াত করুন — অনলাইন লাইভ ক্লাস।'
FROM public.categories c, public.instructors i WHERE c.slug='quran-learning' AND i.name_en='Maulana Abdul Karim';

INSERT INTO public.courses (slug, category_id, instructor_id, title_bn, title_en, short_description_bn, short_description_en, description_bn, description_en, duration_bn, duration_en, total_classes, level_bn, level_en, fee, is_featured, sort_order, seo_title, seo_description)
SELECT 'ecommerce-business', c.id, i.id,
 'ই-কমার্স ব্যবসা শুরু থেকে শেষ','E-commerce Business A to Z',
 'অনলাইন ব্যবসা শুরু, পণ্য সোর্সিং ও মার্কেটিং শিখুন।','Start an online business, source products and market them.',
 'পণ্য নির্বাচন, সাপ্লায়ার ব্যবস্থাপনা, পেজ সেটআপ, ফেসবুক মার্কেটিং ও কাস্টমার সার্ভিস — বাস্তব উদাহরণসহ।','Product selection, supplier management, page setup, Facebook marketing and customer service with real examples.',
 '৪ মাস','4 months',40,'মধ্যম','Intermediate',4500,true,3,
 'ই-কমার্স ব্যবসা কোর্স | Green Bangla Learning Academy','অনলাইন ব্যবসা শুরু করার সম্পূর্ণ গাইডলাইন — সোর্সিং থেকে মার্কেটিং পর্যন্ত।'
FROM public.categories c, public.instructors i WHERE c.slug='business-education' AND i.name_en='Tanvir Hasan';

INSERT INTO public.courses (slug, category_id, instructor_id, title_bn, title_en, short_description_bn, short_description_en, description_bn, description_en, duration_bn, duration_en, total_classes, level_bn, level_en, fee, is_scholarship, is_featured, sort_order, seo_title, seo_description)
SELECT 'freelancing-foundation', c.id, i.id,
 'ফ্রিল্যান্সিং ফাউন্ডেশন','Freelancing Foundation',
 'মার্কেটপ্লেসে কাজ শুরু করার পূর্ণাঙ্গ প্রস্তুতি।','Full preparation to start working on marketplaces.',
 'প্রোফাইল তৈরি, গিগ অপটিমাইজেশন, ক্লায়েন্ট কমিউনিকেশন ও পেমেন্ট উইথড্র প্রক্রিয়া।','Profile building, gig optimization, client communication and payment withdrawal.',
 '৩ মাস','3 months',30,'শিক্ষানবিস','Beginner',0,true,false,4,
 'ফ্রিল্যান্সিং কোর্স (স্কলারশিপ) | Green Bangla Learning Academy','স্কলারশিপে ফ্রিল্যান্সিং শিখুন — প্রোফাইল থেকে প্রথম অর্ডার পর্যন্ত।'
FROM public.categories c, public.instructors i WHERE c.slug='business-education' AND i.name_en='Tanvir Hasan';

INSERT INTO public.courses (slug, category_id, instructor_id, title_bn, title_en, short_description_bn, short_description_en, description_bn, description_en, duration_bn, duration_en, total_classes, level_bn, level_en, fee, is_featured, sort_order, seo_title, seo_description)
SELECT 'public-speaking', c.id, i.id,
 'পাবলিক স্পিকিং ও আত্মবিশ্বাস','Public Speaking & Confidence',
 'মঞ্চে ও ক্যামেরার সামনে আত্মবিশ্বাসী হয়ে উঠুন।','Become confident on stage and on camera.',
 'ভয় কাটানো, বডি ল্যাঙ্গুয়েজ, গল্প বলার কৌশল ও উপস্থাপনা অনুশীলন।','Overcome fear, body language, storytelling techniques and presentation practice.',
 '২ মাস','2 months',16,'সকল স্তর','All levels',1800,true,5,
 'পাবলিক স্পিকিং কোর্স | Green Bangla Learning Academy','আত্মবিশ্বাসের সাথে কথা বলার দক্ষতা অর্জন করুন — লাইভ অনুশীলনভিত্তিক কোর্স।'
FROM public.categories c, public.instructors i WHERE c.slug='personal-development' AND i.name_en='Dr. Nusrat Jahan';

INSERT INTO public.courses (slug, category_id, instructor_id, title_bn, title_en, short_description_bn, short_description_en, description_bn, description_en, duration_bn, duration_en, total_classes, level_bn, level_en, fee, sort_order, seo_title, seo_description)
SELECT 'time-management', c.id, i.id,
 'সময় ব্যবস্থাপনা ও উৎপাদনশীলতা','Time Management & Productivity',
 'প্রতিদিনের সময়কে কাজে লাগানোর কার্যকর পদ্ধতি।','Practical systems to make your day count.',
 'লক্ষ্য নির্ধারণ, অগ্রাধিকার, অভ্যাস গঠন ও ডিজিটাল ডিসট্র্যাকশন নিয়ন্ত্রণ।','Goal setting, prioritization, habit building and controlling digital distraction.',
 '৬ সপ্তাহ','6 weeks',12,'সকল স্তর','All levels',1200,6,
 'সময় ব্যবস্থাপনা কোর্স | Green Bangla Learning Academy','কার্যকর সময় ব্যবস্থাপনার কৌশল শিখে প্রতিদিন বেশি কাজ সম্পন্ন করুন।'
FROM public.categories c, public.instructors i WHERE c.slug='personal-development' AND i.name_en='Dr. Nusrat Jahan';

INSERT INTO public.curriculum_items (course_id, title_bn, description_bn, sort_order)
SELECT id, t.title, t.descr, t.ord FROM public.courses,
 (VALUES ('মডিউল ১: পরিচিতি ও প্রস্তুতি','কোর্সের কাঠামো, লক্ষ্য ও প্রয়োজনীয় উপকরণ।',1),
         ('মডিউল ২: মৌলিক ভিত্তি','বিষয়ের প্রাথমিক ধারণা ও হাতে-কলমে অনুশীলন।',2),
         ('মডিউল ৩: প্রায়োগিক দক্ষতা','বাস্তব উদাহরণ ও কেস স্টাডির মাধ্যমে প্রয়োগ।',3),
         ('মডিউল ৪: মূল্যায়ন ও পরবর্তী ধাপ','চূড়ান্ত মূল্যায়ন, ফিডব্যাক ও এগিয়ে যাওয়ার পরিকল্পনা।',4)
 ) AS t(title, descr, ord);

INSERT INTO public.learning_outcomes (course_id, text_bn, sort_order)
SELECT id, t.txt, t.ord FROM public.courses,
 (VALUES ('বিষয়ের মৌলিক ভিত্তি আত্মস্থ করতে পারবেন',1),
         ('প্রতিদিনের অনুশীলনের মাধ্যমে দক্ষতা গড়ে তুলবেন',2),
         ('বাস্তব পরিস্থিতিতে শেখা জ্ঞান প্রয়োগ করতে পারবেন',3),
         ('কোর্স শেষে আত্মবিশ্বাসের সাথে এগিয়ে যেতে পারবেন',4)
 ) AS t(txt, ord);
