
DROP POLICY "public read categories" ON public.categories;
CREATE POLICY "public read categories" ON public.categories FOR SELECT TO anon, authenticated USING (is_active);

DROP POLICY "public read instructors" ON public.instructors;
CREATE POLICY "public read instructors" ON public.instructors FOR SELECT TO anon, authenticated USING (is_active);

DROP POLICY "public read courses" ON public.courses;
CREATE POLICY "public read courses" ON public.courses FOR SELECT TO anon, authenticated USING (is_published);
