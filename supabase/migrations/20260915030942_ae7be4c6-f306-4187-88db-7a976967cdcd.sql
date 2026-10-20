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

CREATE POLICY "public read site settings" ON public.site_settings
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "admins manage site settings" ON public.site_settings
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER t_site_settings_updated
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.site_settings (key, value, group_name, label, input_type, sort_order) VALUES
  ('site_name', 'Green Bangla Learning Academy', 'general', 'সাইটের নাম', 'text', 1),
  ('site_tagline', 'কুরআন, ব্যবসা এবং ব্যক্তিগত উন্নয়নে মানসম্মত শিক্ষা — সবার জন্য, সহজে।', 'general', 'সাইটের সংক্ষিপ্ত পরিচিতি', 'textarea', 2),
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