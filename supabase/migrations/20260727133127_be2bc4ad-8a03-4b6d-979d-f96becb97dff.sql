
CREATE TABLE public.timetable_entries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  day text NOT NULL,
  start_time text NOT NULL,
  end_time text NOT NULL,
  subject text NOT NULL,
  code text NOT NULL DEFAULT '',
  faculty text NOT NULL DEFAULT '',
  room text NOT NULL DEFAULT '',
  semester text NOT NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.timetable_entries TO authenticated;
GRANT ALL ON public.timetable_entries TO service_role;
ALTER TABLE public.timetable_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read timetable" ON public.timetable_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins write timetable" ON public.timetable_entries FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.academic_calendar (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Academic',
  start_date date NOT NULL,
  end_date date,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.academic_calendar TO authenticated;
GRANT ALL ON public.academic_calendar TO service_role;
ALTER TABLE public.academic_calendar ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read academic calendar" ON public.academic_calendar FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins write academic calendar" ON public.academic_calendar FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
