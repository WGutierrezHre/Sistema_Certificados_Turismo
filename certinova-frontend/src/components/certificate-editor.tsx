'use client';
import type React from 'react';
import {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from 'react';
import {
  motion,
  AnimatePresence,
} from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  User,
  Building,
  Link,
  QrCode,
  Save,
  X,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Award,
} from 'lucide-react';
import { toast } from 'sonner';
import { useCertificates } from '@/context/CertificateContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
type FieldType =
  | 'recipientName'
  | 'organizationName'
  | 'certificateLink'
  | 'certificateQR';
interface FieldPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  color?: string;
}
interface Certificate {
  id?: string;
  name: string;
  event: string;
  date: string;
  image?: string;
  fields: Partial<
    Record<FieldType, FieldPosition>
  >;
}
interface CertificateEditorProps {
  certificate: Partial<Certificate>;
  onSave: (
    certificate: Certificate
  ) => void;
  onClose: () => void;
  isEditing?: boolean;
}
const sanitizeFields = (
  source?: Record<string, FieldPosition>
) => {
  if (!source) {
    return {};
  }
  const cleaned = {
    ...source,
  };
  delete cleaned.rank;
  return cleaned as Partial<
    Record<FieldType, FieldPosition>
  >;
};
export function CertificateEditor({
  certificate,
  onSave,
  onClose,
  isEditing = false,
}: CertificateEditorProps) {
  const {
    uploadTemplate,
  } = useCertificates();
  const [
    uploadedImage,
    setUploadedImage,
  ] = useState<string | null>(
    certificate.image || null
  );
  const [
    uploadedImagePath,
    setUploadedImagePath,
  ] = useState<string | null>(
    certificate.image || null
  );
  const [
    selectedField,
    setSelectedField,
  ] = useState<FieldType | null>(
    null
  );
  const [
    isSelecting,
    setIsSelecting,
  ] = useState(false);
  const [
    selectionStart,
    setSelectionStart,
  ] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [
    fields,
    setFields,
  ] = useState<
    Partial<
      Record<
        FieldType,
        FieldPosition
      >
    >
  >(
    sanitizeFields(
      certificate.fields as Record<
        string,
        FieldPosition
      >
    )
  );
  const [
    imageLoaded,
    setImageLoaded,
  ] = useState(false);
  const [
    draggedField,
    setDraggedField,
  ] = useState<FieldType | null>(
    null
  );
  const [
    dragOffset,
    setDragOffset,
  ] = useState({
    x: 0,
    y: 0,
  });
  const [
    selectedFieldForToolbar,
    setSelectedFieldForToolbar,
  ] = useState<FieldType | null>(
    null
  );
  const [
    isDragging,
    setIsDragging,
  ] = useState(false);
  const [
    dragStartPos,
    setDragStartPos,
  ] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const canvasRef =
    useRef<HTMLDivElement>(
      null
    );
  const fileInputRef =
    useRef<HTMLInputElement>(
      null
    );
  const fontFamilies = [
    'Inter',
    'Roboto',
    'Open Sans',
    'Montserrat',
    'Arial',
    'Times New Roman',
    'Helvetica',
    'Georgia',
    'Verdana',
    'Trebuchet MS',
    'Comic Sans MS',
    'Impact',
    'Lucida Console',
    'Tahoma',
    'Poppins',
    'Lato',
    'Playfair Display',
    'Raleway',
    'Nunito',
    'Oswald',
    'Source Sans 3',
    'Ubuntu',
    'Merriweather',
    'Noto Sans',
    'Rubik',
    'Fira Sans',
    'Dosis',
    'Archivo',
    'Cabin',
    'Quicksand',
    'Josefin Sans',
    'Work Sans',
    'Manrope',
    'Dancing Script',
    'Pacifico',
    'Great Vibes',
    'Allura',
    'Lobster',
    'Satisfy',
    'Cookie',
    'Tangerine',
    'Parisienne',
    'Sacramento',
    'Alex Brush',
    'Mr Dafoe',
    'Zeyada',
    'Petit Formal Script',
    'Qwigley',
    'Rouge Script',
    'Herr Von Muellerhoff',
  ];
  const fieldOptions =
    useMemo(
      () => [
        {
          key:
            'recipientName' as FieldType,
          label:
            'Nombre del destinatario',
          icon: User,
        },
        {
          key:
            'organizationName' as FieldType,
          label:
            'Nombre de la institución',
          icon: Building,
        },
        {
          key:
            'certificateLink' as FieldType,
          label:
            'Enlace del certificado',
          icon: Link,
        },
        {
          key:
            'certificateQR' as FieldType,
          label:
            'Código QR',
          icon: QrCode,
        },
      ],
      []
    );
  useEffect(() => {
    if (certificate.fields) {
      setFields(
        sanitizeFields(
          certificate.fields as Record<
            string,
            FieldPosition
          >
        )
      );
    }
    setImageLoaded(false);
  }, [
    certificate.fields,
  ]);
  const handleImageUpload =
    async (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const file =
        e.target.files?.[0];
      if (!file) {
        return;
      }
      try {
        setImageLoaded(false);
        /* VISTA PREVIA LOCAL */
        const reader =
          new FileReader();
        reader.onload = (
          event
        ) => {
          setUploadedImage(
            event.target
              ?.result as string
          );
        };
        reader.readAsDataURL(
          file
        );
        /* SUBIR AL SERVIDOR */
        const cloudinaryUrl =
          await uploadTemplate(
            file
          );
        if (cloudinaryUrl) {
          setUploadedImagePath(
            cloudinaryUrl
          );
          setUploadedImage(
            cloudinaryUrl
          );
        }
      } catch (error) {
        console.error(
          'Error al subir la plantilla:',
          error
        );
        toast.error(
          'No se pudo subir la plantilla del certificado'
        );
      }
    };
  const handleFieldSelect = (
    fieldType: FieldType
  ) => {
    if (!uploadedImage) {
      toast(
        'Plantilla requerida',
        {
          description:
            'Primero debe subir una plantilla de certificado.',
        }
      );
      return;
    }
    setSelectedField(
      fieldType
    );
    setIsSelecting(true);
    setSelectionStart(null);
    setSelectedFieldForToolbar(
      null
    );
    toast(
      'Modo de selección',
      {
        description:
          'Seleccione dos puntos sobre la plantilla para delimitar el área del campo.',
      }
    );
  };
  const handleCanvasClick =
    useCallback(
      (
        e: React.MouseEvent<HTMLDivElement>
      ) => {
        if (
          !canvasRef.current
        ) {
          return;
        }
        if (
          !isSelecting &&
          !isDragging
        ) {
          const img =
            canvasRef.current
              .querySelector(
                'img'
              );
          if (!img) {
            return;
          }
          const imgRect =
            img.getBoundingClientRect();
          const clickX =
            e.clientX -
            imgRect.left;
          const clickY =
            e.clientY -
            imgRect.top;
          const clickedField =
            Object.entries(
              fields
            ).find(
              ([
                ,
                position,
              ]) => {
                if (!position) {
                  return false;
                }
                const displayScaleX =
                  img.offsetWidth /
                  img.naturalWidth;
                const displayScaleY =
                  img.offsetHeight /
                  img.naturalHeight;
                const displayX =
                  position.x *
                  displayScaleX;
                const displayY =
                  position.y *
                  displayScaleY;
                const displayWidth =
                  position.width *
                  displayScaleX;
                const displayHeight =
                  position.height *
                  displayScaleY;
                return (
                  clickX >=
                    displayX &&
                  clickX <=
                    displayX +
                      displayWidth &&
                  clickY >=
                    displayY &&
                  clickY <=
                    displayY +
                      displayHeight
                );
              }
            );
          if (clickedField) {
            setSelectedFieldForToolbar(
              clickedField[0] as FieldType
            );
          } else {
            setSelectedFieldForToolbar(
              null
            );
          }
          return;
        }
        if (
          !isSelecting ||
          !selectedField
        ) {
          return;
        }
        const img =
          canvasRef.current
            .querySelector(
              'img'
            );
        if (!img) {
          return;
        }
        const imgRect =
          img.getBoundingClientRect();
        const clickX =
          e.clientX -
          imgRect.left;
        const clickY =
          e.clientY -
          imgRect.top;
        const imgDisplayedWidth =
          imgRect.width;
        const imgDisplayedHeight =
          imgRect.height;
        const scaleX =
          img.naturalWidth /
          imgDisplayedWidth;
        const scaleY =
          img.naturalHeight /
          imgDisplayedHeight;
        const actualX =
          clickX *
          scaleX;
        const actualY =
          clickY *
          scaleY;
        /* PRIMER PUNTO */
        if (!selectionStart) {
          setSelectionStart({
            x: actualX,
            y: actualY,
          });
          return;
        }
        /* SEGUNDO PUNTO */
        const width =
          Math.abs(
            actualX -
              selectionStart.x
          );
        const height =
          Math.abs(
            actualY -
              selectionStart.y
          );
        const finalX =
          Math.min(
            actualX,
            selectionStart.x
          );
        const finalY =
          Math.min(
            actualY,
            selectionStart.y
          );
        setFields(
          (prev) => ({
            ...prev,
            [selectedField]: {
              x: finalX,
              y: finalY,
              width,
              height,
              fontFamily:
                'Inter',
              fontWeight:
                'normal',
              fontStyle:
                'normal',
              textDecoration:
                'none',
              color:
                '#000000',
            },
          })
        );
        setIsSelecting(false);
        setSelectedField(null);
        setSelectionStart(null);
        const option =
          fieldOptions.find(
            (field) =>
              field.key ===
              selectedField
          );
        toast(
          'Campo agregado',
          {
            description:
              `${option?.label} fue ubicado correctamente.`,
          }
        );
      },
      [
        isSelecting,
        selectedField,
        selectionStart,
        fieldOptions,
        fields,
        isDragging,
      ]
    );
  const handleMouseMove =
    useCallback(
      (
        e: React.MouseEvent<HTMLDivElement>
      ) => {
        if (
          draggedField &&
          dragStartPos &&
          !isDragging
        ) {
          const currentX =
            e.clientX;
          const currentY =
            e.clientY;
          const distance =
            Math.sqrt(
              Math.pow(
                currentX -
                  dragStartPos.x,
                2
              ) +
              Math.pow(
                currentY -
                  dragStartPos.y,
                2
              )
            );
          if (
            distance > 5
          ) {
            setIsDragging(true);
          }
        }
        if (
          !isDragging ||
          !draggedField ||
          !canvasRef.current
        ) {
          return;
        }
        const img =
          canvasRef.current
            .querySelector(
              'img'
            );
        if (!img) {
          return;
        }
        const imgRect =
          img.getBoundingClientRect();
        const mouseX =
          e.clientX -
          imgRect.left -
          dragOffset.x;
        const mouseY =
          e.clientY -
          imgRect.top -
          dragOffset.y;
        const scaleX =
          img.naturalWidth /
          img.offsetWidth;
        const scaleY =
          img.naturalHeight /
          img.offsetHeight;
        const actualX =
          Math.max(
            0,
            mouseX *
              scaleX
          );
        const actualY =
          Math.max(
            0,
            mouseY *
              scaleY
          );
        setFields(
          (prev) => {
            const current =
              prev[
                draggedField
              ];
            if (!current) {
              return prev;
            }
            return {
              ...prev,
              [draggedField]: {
                ...current,
                x: actualX,
                y: actualY,
              },
            };
          }
        );
      },
      [
        draggedField,
        dragOffset,
        isDragging,
        dragStartPos,
      ]
    );
  const handleMouseUp =
    useCallback(
      () => {
        if (
          draggedField
        ) {
          setDraggedField(
            null
          );
          setDragOffset({
            x: 0,
            y: 0,
          });
          setIsDragging(
            false
          );
          setDragStartPos(
            null
          );
        }
      },
      [
        draggedField,
      ]
    );
  const updateFieldStyle = (
    fieldType: FieldType,
    styleProperty:
      keyof FieldPosition,
    value:
      string | number
  ) => {
    setFields(
      (prev) => {
        const current =
          prev[fieldType];
        if (!current) {
          return prev;
        }
        return {
          ...prev,
          [fieldType]: {
            ...current,
            [styleProperty]:
              value,
          },
        };
      }
    );
  };
  const handleSave = () => {
    if (!uploadedImage) {
      toast(
        'Plantilla requerida',
        {
          description:
            'Debe subir una plantilla antes de guardar el certificado.',
        }
      );
      return;
    }
    const savedCertificate:
      Certificate = {
      id:
        certificate.id ||
        Date.now().toString(),
      name:
        certificate.name ||
        'Certificado sin título',
      event:
        certificate.event ||
        'Evento sin especificar',
      date:
        certificate.date ||
        new Date()
          .toLocaleDateString(
            'es-BO'
          ),
      image:
        uploadedImagePath ||
        uploadedImage ||
        '/placeholder-certificate.jpg',
      fields,
    };
    onSave(
      savedCertificate
    );
    toast(
      isEditing
        ? 'Certificado actualizado'
        : 'Certificado guardado',
      {
        description:
          isEditing
            ? 'La plantilla del certificado fue actualizada correctamente.'
            : 'La plantilla del certificado fue guardada correctamente.',
      }
    );
  };
  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-[#001f40]/70
        p-3
        backdrop-blur-sm
        sm:p-5
      "
    >
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.96,
          y: 20,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        transition={{
          duration: 0.3,
        }}
        className="
          flex
          max-h-[94vh]
          w-full
          max-w-[1400px]
          flex-col
          overflow-hidden
          rounded-3xl
          border
          border-white/20
          bg-white
          shadow-2xl
          shadow-black/30
        "
      >
        <AnimatePresence>
          {selectedFieldForToolbar &&
            fields[
              selectedFieldForToolbar
            ] && (
            <motion.div
              initial={{
                opacity: 0,
                y: -40,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -40,
              }}
              className="
                z-20
                border-b
                border-[#003874]/10
                bg-white
                px-4
                py-3
                shadow-sm
              "
            >
              <div
                className="
                  flex
                  flex-wrap
                  items-center
                  justify-center
                  gap-2
                  sm:gap-3
                "
              >
                {/* FUENTE */}
                <DropdownMenu>
                  <DropdownMenuTrigger
                    asChild
                  >
                    <Button
                      variant="outline"
                      className="
                        min-w-[150px]
                        justify-between
                        rounded-xl
                        border-[#003874]/20
                        bg-white
                        text-[#003874]
                        hover:bg-[#eef5ff]
                        hover:text-[#003874]
                      "
                    >
                      {
                        fields[
                          selectedFieldForToolbar
                        ]?.fontFamily ||
                        'Inter'
                      }
                      <span
                        className="
                          ml-2
                          text-xs
                        "
                      >
                        ▼
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="
                      max-h-72
                      w-52
                      overflow-y-auto
                      rounded-xl
                    "
                  >
                    {fontFamilies.map(
                      (font) => (
                        <DropdownMenuItem
                          key={font}
                          onClick={() =>
                            updateFieldStyle(
                              selectedFieldForToolbar,
                              'fontFamily',
                              font
                            )
                          }
                          className={`
                            cursor-pointer
                            ${
                              fields[
                                selectedFieldForToolbar
                              ]?.fontFamily ===
                              font
                                ? `
                                  bg-[#eef5ff]
                                  text-[#003874]
                                `
                                : ''
                            }
                          `}
                          style={{
                            fontFamily:
                              font,
                          }}
                        >
                          {font}
                        </DropdownMenuItem>
                      )
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                {/* ESTILOS DE TEXTO */}
                <div
                  className="
                    flex
                    items-center
                    gap-1
                    rounded-xl
                    border
                    border-gray-200
                    bg-gray-50
                    p-1
                  "
                >
                  <Button
                    variant={
                      fields[
                        selectedFieldForToolbar
                      ]?.fontWeight ===
                      'bold'
                        ? 'default'
                        : 'ghost'
                    }
                    size="sm"
                    onClick={() =>
                      updateFieldStyle(
                        selectedFieldForToolbar,
                        'fontWeight',
                        fields[
                          selectedFieldForToolbar
                        ]?.fontWeight ===
                        'bold'
                          ? 'normal'
                          : 'bold'
                      )
                    }
                    className="
                      h-8
                      w-8
                      rounded-lg
                      p-0
                      data-[state=active]:bg-[#003874]
                    "
                    aria-label="Negrita"
                  >
                    <Bold
                      className="
                        h-4
                        w-4
                      "
                    />
                  </Button>
                  <Button
                    variant={
                      fields[
                        selectedFieldForToolbar
                      ]?.fontStyle ===
                      'italic'
                        ? 'default'
                        : 'ghost'
                    }
                    size="sm"
                    onClick={() =>
                      updateFieldStyle(
                        selectedFieldForToolbar,
                        'fontStyle',
                        fields[
                          selectedFieldForToolbar
                        ]?.fontStyle ===
                        'italic'
                          ? 'normal'
                          : 'italic'
                      )
                    }
                    className="
                      h-8
                      w-8
                      rounded-lg
                      p-0
                    "
                    aria-label="Cursiva"
                  >
                    <Italic
                      className="
                        h-4
                        w-4
                      "
                    />
                  </Button>
                  <Button
                    variant={
                      fields[
                        selectedFieldForToolbar
                      ]?.textDecoration ===
                      'underline'
                        ? 'default'
                        : 'ghost'
                    }
                    size="sm"
                    onClick={() =>
                      updateFieldStyle(
                        selectedFieldForToolbar,
                        'textDecoration',
                        fields[
                          selectedFieldForToolbar
                        ]?.textDecoration ===
                        'underline'
                          ? 'none'
                          : 'underline'
                      )
                    }
                    className="
                      h-8
                      w-8
                      rounded-lg
                      p-0
                    "
                    aria-label="Subrayado"
                  >
                    <Underline
                      className="
                        h-4
                        w-4
                      "
                    />
                  </Button>
                </div>
                {/* COLOR */}
                <div
                  className="
                    flex
                    h-10
                    items-center
                    gap-2
                    rounded-xl
                    border
                    border-gray-200
                    bg-gray-50
                    px-3
                  "
                >
                  <Palette
                    className="
                      h-4
                      w-4
                      text-[#003874]
                    "
                  />
                  <input
                    type="color"
                    value={
                      fields[
                        selectedFieldForToolbar
                      ]?.color ||
                      '#000000'
                    }
                    onChange={(e) =>
                      updateFieldStyle(
                        selectedFieldForToolbar,
                        'color',
                        e.target.value
                      )
                    }
                    className="
                      h-7
                      w-7
                      cursor-pointer
                      rounded
                      border-0
                      bg-transparent
                      p-0
                    "
                    title="Color del texto"
                  />
                </div>
                {/* ALINEACIÓN */}
                <div
                  className="
                    flex
                    items-center
                    gap-1
                    rounded-xl
                    border
                    border-gray-200
                    bg-gray-50
                    p-1
                  "
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="
                      h-8
                      w-8
                      rounded-lg
                      p-0
                      text-[#003874]
                    "
                    aria-label="Alinear a la izquierda"
                  >
                    <AlignLeft
                      className="
                        h-4
                        w-4
                      "
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="
                      h-8
                      w-8
                      rounded-lg
                      p-0
                      text-[#003874]
                    "
                    aria-label="Centrar"
                  >
                    <AlignCenter
                      className="
                        h-4
                        w-4
                      "
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="
                      h-8
                      w-8
                      rounded-lg
                      p-0
                      text-[#003874]
                    "
                    aria-label="Alinear a la derecha"
                  >
                    <AlignRight
                      className="
                        h-4
                        w-4
                      "
                    />
                  </Button>
                </div>
                {/* CERRAR TOOLBAR */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setSelectedFieldForToolbar(
                      null
                    )
                  }
                  className="
                    h-9
                    w-9
                    rounded-xl
                    p-0
                    text-gray-500
                    hover:bg-red-50
                    hover:text-red-600
                  "
                  aria-label="Cerrar herramientas"
                >
                  <X
                    className="
                      h-4
                      w-4
                    "
                  />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div
          className="
            flex
            min-h-0
            flex-1
            flex-col
            lg:flex-row
          "
        >
          <aside
            className="
              w-full
              shrink-0
              overflow-y-auto
              border-b
              border-[#003874]/10
              bg-[#f8fbff]
              lg:w-[340px]
              lg:border-b-0
              lg:border-r
            "
          >
            {/* CABECERA */}
            <div
              className="
                border-b
                border-[#003874]/10
                bg-[#003874]
                px-5
                py-5
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-3
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >
                  <div
                    className="
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-xl
                      bg-[#ffde32]
                    "
                  >
                    <Award
                      className="
                        h-6
                        w-6
                        text-[#003874]
                      "
                    />
                  </div>
                  <div>
                    <h2
                      className="
                        text-lg
                        font-bold
                        text-white
                      "
                    >
                      Editor de certificado
                    </h2>
                    <p
                      className="
                        mt-0.5
                        text-xs
                        text-blue-100
                      "
                    >
                      Carrera de Turismo UMSA
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="
                    h-9
                    w-9
                    rounded-xl
                    p-0
                    text-white
                    hover:bg-white/10
                    hover:text-white
                  "
                  aria-label="Cerrar editor"
                >
                  <X
                    className="
                      h-5
                      w-5
                    "
                  />
                </Button>
              </div>
            </div>
            <div
              className="
                space-y-5
                p-5
              "
            >
              <AnimatePresence>
                {!uploadedImage && (
                  <motion.div
                    initial={{
                      opacity: 1,
                      height: 'auto',
                    }}
                    exit={{
                      opacity: 0,
                      height: 0,
                      transition: {
                        duration: 0.3,
                      },
                    }}
                  >
                    <Card
                      className="
                        rounded-2xl
                        border
                        border-[#003874]/10
                        bg-white
                        shadow-sm
                      "
                    >
                      <CardHeader
                        className="
                          pb-3
                        "
                      >
                        <CardTitle
                          className="
                            text-sm
                            font-bold
                            text-[#003874]
                          "
                        >
                          Plantilla del certificado
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div
                          onClick={() =>
                            fileInputRef
                              .current
                              ?.click()
                          }
                          className="
                            cursor-pointer
                            rounded-xl
                            border-2
                            border-dashed
                            border-[#003874]/20
                            bg-[#f8fbff]
                            p-6
                            text-center
                            transition-all
                            duration-300
                            hover:border-[#003874]
                            hover:bg-[#eef5ff]
                          "
                        >
                          <div
                            className="
                              mx-auto
                              mb-3
                              flex
                              h-12
                              w-12
                              items-center
                              justify-center
                              rounded-xl
                              bg-[#ffde32]
                            "
                          >
                            <Upload
                              className="
                                h-6
                                w-6
                                text-[#003874]
                              "
                            />
                          </div>
                          <p
                            className="
                              text-sm
                              font-semibold
                              text-[#003874]
                            "
                          >
                            Subir plantilla
                          </p>
                          <p
                            className="
                              mt-1
                              text-xs
                              text-gray-400
                            "
                          >
                            Seleccione una imagen
                            desde su equipo
                          </p>
                        </div>
                        <input
                          ref={
                            fileInputRef
                          }
                          type="file"
                          accept="image/*"
                          onChange={
                            handleImageUpload
                          }
                          className="hidden"
                        />
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
              <Card
                className="
                  rounded-2xl
                  border
                  border-[#003874]/10
                  bg-white
                  shadow-sm
                "
              >
                <CardContent
                  className="
                    p-4
                  "
                >
                  <div
                    className="
                      space-y-2
                    "
                  >
                    {fieldOptions.map(
                      (option) => {
                        const Icon =
                          option.icon;
                        const isAdded =
                          Boolean(
                            fields[
                              option.key
                            ]
                          );
                        return (
                          <Button
                            key={
                              option.key
                            }
                            variant="outline"
                            className="
                              h-auto
                              min-h-12
                              w-full
                              justify-start
                              rounded-xl
                              border
                              border-gray-200
                              bg-white
                              px-3
                              py-2
                              text-left
                              text-[#003874]
                              transition-all
                              hover:border-[#003874]/30
                              hover:bg-[#eef5ff]
                              hover:text-[#003874]
                              disabled:opacity-50
                            "
                            onClick={() =>
                              handleFieldSelect(
                                option.key
                              )
                            }
                            disabled={
                              !uploadedImage
                            }
                          >
                            <div
                              className="
                                mr-3
                                flex
                                h-9
                                w-9
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                bg-[#eef5ff]
                              "
                            >
                              <Icon
                                className="
                                  h-4
                                  w-4
                                  text-[#003874]
                                "
                              />
                            </div>
                            <span
                              className="
                                flex-1
                                whitespace-normal
                                text-sm
                                font-semibold
                              "
                            >
                              {option.label}
                            </span>
                            {isAdded && (
                              <Badge
                                variant="secondary"
                                className="
                                  ml-2
                                  border
                                  border-[#ffde32]
                                  bg-[#fff9d8]
                                  font-bold
                                  text-[#003874]
                                "
                              >
                                ✓
                              </Badge>
                            )}
                          </Button>
                        );
                      }
                    )}
                  </div>
                </CardContent>
              </Card>
              <Button
                onClick={
                  handleSave
                }
                disabled={
                  !uploadedImage
                }
                className="
                  h-12
                  w-full
                  rounded-xl
                  bg-[#003874]
                  font-bold
                  text-white
                  shadow-md
                  shadow-blue-950/10
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:bg-[#002b59]
                  disabled:cursor-not-allowed
                "
              >
                <Save
                  className="
                    mr-2
                    h-4
                    w-4
                  "
                />
                {isEditing
                  ? 'Actualizar certificado'
                  : 'Guardar certificado'
                }
              </Button>
            </div>
          </aside>
          <main
            className="
              min-h-[500px]
              flex-1
              overflow-auto
              bg-[#eef2f6]
              p-4
              sm:p-6
              lg:p-8
            "
          >
            <div
              className="
                flex
                h-full
                min-h-[450px]
                items-center
                justify-center
              "
            >
              {uploadedImage ? (
                <div
                  className="
                    relative
                    max-w-full
                    rounded-2xl
                    bg-white
                    p-3
                    shadow-xl
                    shadow-[#003874]/10
                  "
                >
                  <div
                    ref={
                      canvasRef
                    }
                    className="
                      relative
                      overflow-hidden
                      rounded-xl
                      border
                      border-[#003874]/10
                      bg-white
                    "
                    onClick={
                      handleCanvasClick
                    }
                    onMouseMove={
                      handleMouseMove
                    }
                    onMouseUp={
                      handleMouseUp
                    }
                    onMouseLeave={
                      handleMouseUp
                    }
                    style={{
                      maxWidth:
                        '100%',
                      maxHeight:
                        '100%',
                      cursor:
                        isSelecting
                          ? 'crosshair'
                          : isDragging
                            ? 'grabbing'
                            : 'default',
                    }}
                  >
                    <div
                      className="
                        relative
                        inline-block
                      "
                    >
                      <img
                        src={
                          uploadedImage ||
                          '/placeholder.svg'
                        }
                        alt="Plantilla del certificado"
                        className="
                          max-h-[72vh]
                          max-w-full
                          select-none
                          object-contain
                        "
                        draggable={
                          false
                        }
                        onLoad={() =>
                          setImageLoaded(
                            true
                          )
                        }
                        onError={() =>
                          setImageLoaded(
                            false
                          )
                        }
                      />
                      {imageLoaded &&
                        Object.entries(
                          fields
                        ).map(
                          ([
                            fieldType,
                            position,
                          ]) => {
                            if (
                              !position
                            ) {
                              return null;
                            }
                            const option =
                              fieldOptions.find(
                                (
                                  field
                                ) =>
                                  field.key ===
                                  fieldType
                              );
                            if (!option) {
                              return null;
                            }
                            const img =
                              canvasRef
                                .current
                                ?.querySelector(
                                  'img'
                                );
                            if (
                              !img ||
                              !img.complete ||
                              img.naturalWidth ===
                                0
                            ) {
                              return null;
                            }
                            const displayScaleX =
                              img.offsetWidth /
                              img.naturalWidth;
                            const displayScaleY =
                              img.offsetHeight /
                              img.naturalHeight;
                            const displayX =
                              position.x *
                              displayScaleX;
                            const displayY =
                              position.y *
                              displayScaleY;
                            const displayWidth =
                              position.width *
                              displayScaleX;
                            const displayHeight =
                              position.height *
                              displayScaleY;
                            const isSelected =
                              selectedFieldForToolbar ===
                              fieldType;
                            return (
                              <motion.div
                                key={
                                  fieldType
                                }
                                className={`
                                  absolute
                                  flex
                                  items-center
                                  justify-center
                                  border-2
                                  border-dashed
                                  transition-colors
                                  ${
                                    isSelected
                                      ? `
                                        border-[#ffde32]
                                        bg-[#ffde32]/25
                                      `
                                      : `
                                        border-[#003874]
                                        bg-[#003874]/10
                                      `
                                  }
                                  ${
                                    isDragging &&
                                    draggedField ===
                                      fieldType
                                      ? 'cursor-grabbing'
                                      : 'cursor-grab'
                                  }
                                `}
                                style={{
                                  left:
                                    displayX,
                                  top:
                                    displayY,
                                  width:
                                    displayWidth,
                                  height:
                                    displayHeight,
                                }}
                                whileHover={{
                                  scale:
                                    1.01,
                                }}
                                transition={{
                                  type:
                                    'spring',
                                  stiffness:
                                    300,
                                  damping:
                                    30,
                                }}
                                onMouseDown={(
                                  e
                                ) => {
                                  e.stopPropagation();
                                  const img =
                                    canvasRef
                                      .current
                                      ?.querySelector(
                                        'img'
                                      );
                                  if (!img) {
                                    return;
                                  }
                                  const imgRect =
                                    img.getBoundingClientRect();
                                  const mouseX =
                                    e.clientX -
                                    imgRect.left;
                                  const mouseY =
                                    e.clientY -
                                    imgRect.top;
                                  setDraggedField(
                                    fieldType as FieldType
                                  );
                                  setDragOffset({
                                    x:
                                      mouseX -
                                      displayX,
                                    y:
                                      mouseY -
                                      displayY,
                                  });
                                  setDragStartPos({
                                    x:
                                      e.clientX,
                                    y:
                                      e.clientY,
                                  });
                                  setIsDragging(
                                    false
                                  );
                                }}
                                onClick={(
                                  e
                                ) => {
                                  e.stopPropagation();
                                  if (
                                    !isDragging
                                  ) {
                                    setSelectedFieldForToolbar(
                                      fieldType as FieldType
                                    );
                                  }
                                }}
                              >
                                <Badge
                                  variant="secondary"
                                  className="
                                    pointer-events-none
                                    max-w-[90%]
                                    truncate
                                    border
                                    border-[#003874]/10
                                    bg-white
                                    text-xs
                                    font-semibold
                                    text-[#003874]
                                    shadow-sm
                                  "
                                >
                                  {
                                    option.label
                                  }
                                </Badge>
                              </motion.div>
                            );
                          }
                        )}
                      {isSelecting &&
                        selectedField && (
                        <div
                          className="
                            pointer-events-none
                            absolute
                            inset-0
                            border-2
                            border-dashed
                            border-[#ffde32]
                            bg-[#003874]/10
                          "
                        >
                          <div
                            className="
                              absolute
                              left-3
                              top-3
                            "
                          >
                            <Badge
                              className="
                                border
                                border-[#ffde32]
                                bg-[#003874]
                                px-3
                                py-1.5
                                text-white
                                shadow-lg
                              "
                            >
                              Seleccionando:
                              {' '}
                              {
                                fieldOptions.find(
                                  (
                                    field
                                  ) =>
                                    field.key ===
                                    selectedField
                                )
                                  ?.label
                              }
                            </Badge>
                          </div>
                          {selectionStart && (
                            <div
                              className="
                                absolute
                                bottom-3
                                left-3
                                rounded-lg
                                bg-[#ffde32]
                                px-3
                                py-2
                                text-xs
                                font-bold
                                text-[#003874]
                                shadow-lg
                              "
                            >
                              Primer punto seleccionado.
                              Seleccione el segundo punto.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="
                    max-w-md
                    text-center
                  "
                >
                  <div
                    className="
                      mx-auto
                      mb-5
                      flex
                      h-20
                      w-20
                      items-center
                      justify-center
                      rounded-3xl
                      bg-white
                      shadow-md
                      shadow-[#003874]/10
                    "
                  >
                    <Upload
                      className="
                        h-9
                        w-9
                        text-[#003874]
                      "
                    />
                  </div>
                  <h3
                    className="
                      text-xl
                      font-bold
                      text-[#003874]
                    "
                  >
                    Suba una plantilla de certificado
                  </h3>
                  <p
                    className="
                      mt-2
                      text-sm
                      leading-relaxed
                      text-gray-500
                    "
                  >
                    Seleccione una imagen de su
                    certificado para comenzar a
                    ubicar los campos correspondientes.
                  </p>
                  <Button
                    onClick={() =>
                      fileInputRef
                        .current
                        ?.click()
                    }
                    className="
                      mt-6
                      h-11
                      rounded-xl
                      bg-[#ffde32]
                      px-6
                      font-bold
                      text-[#003874]
                      shadow-md
                      transition-all
                      hover:-translate-y-0.5
                      hover:bg-[#f5d000]
                      hover:text-[#003874]
                    "
                  >
                    <Upload
                      className="
                        mr-2
                        h-4
                        w-4
                      "
                    />
                    Seleccionar plantilla
                  </Button>
                </div>
              )}
            </div>
          </main>
        </div>
      </motion.div>
    </div>
  );
}