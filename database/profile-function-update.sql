-- Updated profile creation function to handle signup data properly
-- Run this AFTER the main schema to update the function

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    avatar_url, 
    user_role,
    website,
    university_id
  )
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'user_role', 'investor'),
    NEW.raw_user_meta_data->>'website',
    CASE 
      WHEN NEW.raw_user_meta_data->>'university_id' IS NOT NULL 
        AND NEW.raw_user_meta_data->>'university_id' != '' 
      THEN (NEW.raw_user_meta_data->>'university_id')::bigint 
      ELSE NULL 
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Make sure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
