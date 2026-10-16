import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";

export const LANG_COOKIE = "egyptora_lang";

/** Reads the visitor's language cookie on the server so the first HTML has the right lang/dir. */
export const getLangCookie = createServerFn({ method: "GET" }).handler(async () => {
  return getCookie(LANG_COOKIE) ?? null;
});
