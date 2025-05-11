import * as z from "zod"

// Esquema para validación de formularios SEO generales
export const seoFormSchema = z.object({
  title: z
    .string()
    .min(1, "El título es obligatorio")
    .max(70, "El título debe tener máximo 70 caracteres")
    .refine((val) => !val.includes("  "), {
      message: "El título no debe contener espacios dobles",
    }),
  description: z
    .string()
    .min(1, "La descripción es obligatoria")
    .max(160, "La descripción debe tener máximo 160 caracteres")
    .refine((val) => val.length >= 50, {
      message: "La descripción debe tener al menos 50 caracteres para mejor SEO",
    }),
  keywords: z.array(z.string()).min(1, "Debes incluir al menos una palabra clave").optional(),
  canonicalUrl: z.string().url("La URL canónica debe ser una URL válida").optional().or(z.literal("")),
  ogTitle: z.string().max(70, "El título Open Graph debe tener máximo 70 caracteres").optional().or(z.literal("")),
  ogDescription: z
    .string()
    .max(200, "La descripción Open Graph debe tener máximo 200 caracteres")
    .optional()
    .or(z.literal("")),
  ogImage: z.string().url("La URL de imagen Open Graph debe ser una URL válida").optional().or(z.literal("")),
  twitterCard: z.enum(["summary", "summary_large_image", "app", "player"]).optional(),
  twitterTitle: z.string().max(70, "El título de Twitter debe tener máximo 70 caracteres").optional().or(z.literal("")),
  twitterDescription: z
    .string()
    .max(200, "La descripción de Twitter debe tener máximo 200 caracteres")
    .optional()
    .or(z.literal("")),
  twitterImage: z.string().url("La URL de imagen de Twitter debe ser una URL válida").optional().or(z.literal("")),
  structuredData: z
    .string()
    .refine(
      (val) => {
        if (!val) return true
        try {
          JSON.parse(val)
          return true
        } catch {
          return false
        }
      },
      {
        message: "Los datos estructurados deben ser un JSON válido",
      },
    )
    .optional()
    .or(z.literal("")),
})

// Esquema para validación de información de negocio local
export const localBusinessSchema = z.object({
  name: z.string().min(1, "El nombre del negocio es obligatorio"),
  type: z.string().min(1, "El tipo de negocio es obligatorio"),
  streetAddress: z.string().min(1, "La dirección es obligatoria"),
  addressLocality: z.string().min(1, "La localidad es obligatoria"),
  addressRegion: z.string().min(1, "La región es obligatoria"),
  postalCode: z.string().min(1, "El código postal es obligatorio"),
  addressCountry: z.string().min(1, "El país es obligatorio"),
  telephone: z.string().min(1, "El teléfono es obligatorio"),
  email: z.string().email("El email debe ser válido").min(1, "El email es obligatorio"),
  openingHours: z.array(
    z.object({
      dayOfWeek: z.string().min(1, "El día de la semana es obligatorio"),
      opens: z.string().min(1, "La hora de apertura es obligatoria"),
      closes: z.string().min(1, "La hora de cierre es obligatoria"),
    }),
  ),
  hasMap: z.string().url("La URL del mapa debe ser válida").optional().or(z.literal("")),
  geo: z.object({
    latitude: z.string().min(1, "La latitud es obligatoria"),
    longitude: z.string().min(1, "La longitud es obligatoria"),
  }),
  logo: z.string().url("La URL del logo debe ser válida").optional().or(z.literal("")),
  image: z.string().url("La URL de la imagen debe ser válida").optional().or(z.literal("")),
  priceRange: z.string().optional().or(z.literal("")),
})

// Esquema para validación de perfiles de redes sociales
export const socialMediaSchema = z.object({
  facebook: z.string().url("La URL de Facebook debe ser válida").optional().or(z.literal("")),
  twitter: z.string().url("La URL de Twitter debe ser válida").optional().or(z.literal("")),
  instagram: z.string().url("La URL de Instagram debe ser válida").optional().or(z.literal("")),
  youtube: z.string().url("La URL de YouTube debe ser válida").optional().or(z.literal("")),
  linkedin: z.string().url("La URL de LinkedIn debe ser válida").optional().or(z.literal("")),
  pinterest: z.string().url("La URL de Pinterest debe ser válida").optional().or(z.literal("")),
  tiktok: z.string().url("La URL de TikTok debe ser válida").optional().or(z.literal("")),
})

// Tipos derivados de los esquemas
export type SeoFormValues = z.infer<typeof seoFormSchema>
export type LocalBusinessValues = z.infer<typeof localBusinessSchema>
export type SocialMediaValues = z.infer<typeof socialMediaSchema>
