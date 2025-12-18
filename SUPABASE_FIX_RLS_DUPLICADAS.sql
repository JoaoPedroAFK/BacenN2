-- ============================================
-- SCRIPT PARA CORRIGIR POLÍTICAS RLS DUPLICADAS
-- Remove todas as políticas duplicadas e cria políticas únicas
-- ============================================

-- 1. REMOVER TODAS AS POLÍTICAS EXISTENTES (para começar do zero)
DO $$
DECLARE
  r RECORD;
BEGIN
  -- Remover todas as políticas de fichas_bacen
  FOR r IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'fichas_bacen'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.fichas_bacen', r.policyname);
    RAISE NOTICE 'Removida política: %', r.policyname;
  END LOOP;

  -- Remover todas as políticas de fichas_n2
  FOR r IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'fichas_n2'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.fichas_n2', r.policyname);
    RAISE NOTICE 'Removida política: %', r.policyname;
  END LOOP;

  -- Remover todas as políticas de fichas_chatbot
  FOR r IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'fichas_chatbot'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.fichas_chatbot', r.policyname);
    RAISE NOTICE 'Removida política: %', r.policyname;
  END LOOP;
END;
$$;

-- 2. CRIAR POLÍTICAS ÚNICAS E CORRETAS

-- ===== FICHAS_BACEN =====
CREATE POLICY "anon_select_fichas_bacen" ON public.fichas_bacen
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "anon_insert_fichas_bacen" ON public.fichas_bacen
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "anon_update_fichas_bacen" ON public.fichas_bacen
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "anon_delete_fichas_bacen" ON public.fichas_bacen
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- ===== FICHAS_N2 =====
CREATE POLICY "anon_select_fichas_n2" ON public.fichas_n2
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "anon_insert_fichas_n2" ON public.fichas_n2
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "anon_update_fichas_n2" ON public.fichas_n2
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "anon_delete_fichas_n2" ON public.fichas_n2
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- ===== FICHAS_CHATBOT =====
CREATE POLICY "anon_select_fichas_chatbot" ON public.fichas_chatbot
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "anon_insert_fichas_chatbot" ON public.fichas_chatbot
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "anon_update_fichas_chatbot" ON public.fichas_chatbot
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "anon_delete_fichas_chatbot" ON public.fichas_chatbot
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- 3. VERIFICAR POLÍTICAS CRIADAS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename IN ('fichas_bacen', 'fichas_n2', 'fichas_chatbot')
ORDER BY tablename, cmd, policyname;

