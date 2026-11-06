'use client';

import type React from 'react';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

import {
  Send,
  Upload,
  User,
  Award,
  Download,
  FileText,
  FileDown,
  CheckCircle,
  Loader2,
  FileSpreadsheet,
  X,
  Mail,
} from 'lucide-react';

import { toast } from 'sonner';
import confetti from 'canvas-confetti';

import { useCertificates } from '@/context/CertificateContext';
import { CertificateConfig } from '@/types/certificate';
import { certificateService } from '@/services/certificate';

import * as XLSX from 'xlsx';

import { v4 as uuidv4 } from 'uuid';

import QRCode from 'qrcode';

import { PasswordDialog } from '@/components/password-dialog';
import { EncryptedCache } from '@/utils/crypto';

import { exportCertificatesUnified } from '@/lib/pdfExport';
import { getFullImageUrl } from '@/lib/utils';



interface CertificateForSending {
  id: string;
  name: string;
  event: string;
  date: string;
  image: string;
}


interface SendCertificatesModalProps {
  open: boolean;
  onClose: () => void;
  certificates: CertificateForSending[];
}


interface Recipient {
  name: string;
  email?: string;
  uuid?: string;
}



export function SendCertificatesModal({
  open,
  onClose,
  certificates,
}: SendCertificatesModalProps) {

  const BASE_URL =
    typeof window !== 'undefined'
      ? window.location.origin
      : '';


  const {
    getCertificateConfig,
  } = useCertificates();



  const [step, setStep] =
    useState(1);


  const [
    selectedCertificate,
    setSelectedCertificate,
  ] = useState('');


  const [
    recipients,
    setRecipients,
  ] = useState<Recipient[]>([]);


  const [
    manualName,
    setManualName,
  ] = useState('');


  const [
    manualEmail,
    setManualEmail,
  ] = useState('');


  const [
    isGenerating,
    setIsGenerating,
  ] = useState(false);


  const [
    generationComplete,
    setGenerationComplete,
  ] = useState(false);


  const [
    certificateConfig,
    setCertificateConfig,
  ] = useState<CertificateConfig | null>(
    null
  );


  const [
    generatedDataUrls,
    setGeneratedDataUrls,
  ] = useState<
    {
      recipientName: string;
      imageDataUrl: string;
    }[]
  >([]);


  const [
    showPasswordDialog,
    setShowPasswordDialog,
  ] = useState(false);


  const [
    isStoringData,
    setIsStoringData,
  ] = useState(false);


  const [
    generatedImages,
    setGeneratedImages,
  ] = useState<string[]>([]);


  const [
    generatedCertificateId,
    setGeneratedCertificateId,
  ] = useState('');


  const [
    isSendingEmails,
    setIsSendingEmails,
  ] = useState(false);


  const [
    emailProgress,
    setEmailProgress,
  ] = useState<{
    sent: number;
    failed: number;
    total: number;

    status:
      | 'idle'
      | 'sending'
      | 'completed';

    details: Array<{
      email: string;

      status:
        | 'sent'
        | 'failed'
        | 'pending';

      error?: string;
    }>;
  }>({
    sent: 0,
    failed: 0,
    total: 0,
    status: 'idle',
    details: [],
  });



  const nameFields = [
    'name',
    'full name',
    'student name',
    'participant',
    'recipient',
    'candidate',
    'nombre',
    'nombre completo',
    'estudiante',
    'participante',
    'destinatario',
  ];


  const emailFields = [
    'email',
    'email address',
    'mail',
    'correo',
    'correo electronico',
    'correo electrónico',
  ];



  /* =========================================================
     CARGAR CONFIGURACIÓN DEL CERTIFICADO
  ========================================================= */

  useEffect(() => {

    if (!selectedCertificate) {

      setCertificateConfig(null);

      return;

    }


    const fetchConfig =
      async () => {

        try {

          const config =
            await getCertificateConfig(
              selectedCertificate
            );


          if (config) {

            setCertificateConfig(
              config
            );

          }

        } catch (error) {

          console.error(
            'Error al obtener la configuración:',
            error
          );


          toast.error(
            'No se pudo cargar la configuración del certificado'
          );

        }

      };


    fetchConfig();

  }, [
    selectedCertificate,
    getCertificateConfig,
  ]);



  /* =========================================================
     AGREGAR DESTINATARIO MANUAL
  ========================================================= */

  const handleAddManualRecipient = () => {

    if (!manualName.trim()) {

      toast.error(
        'El nombre es obligatorio',
        {
          description:
            'Ingrese el nombre del destinatario.',
        }
      );

      return;

    }


    const recipient: Recipient = {

      name:
        manualName.trim(),

      email:
        manualEmail.trim() ||
        undefined,

      uuid:
        uuidv4(),

    };


    setRecipients(
      (prev) => [
        ...prev,
        recipient,
      ]
    );


    setManualName('');

    setManualEmail('');


    toast.success(
      'Destinatario agregado',
      {
        description:
          `${recipient.name} fue agregado correctamente.`,
      }
    );

  };



  /* =========================================================
     DESCARGAR ARCHIVO DE EJEMPLO
  ========================================================= */

  const handleDownloadSample = () => {

    const link =
      document.createElement(
        'a'
      );


    link.href =
      '/uploads/sample.csv';


    link.download =
      'ejemplo_destinatarios.csv';


    document.body
      .appendChild(link);


    link.click();


    document.body
      .removeChild(link);


    toast.success(
      'Archivo descargado',
      {
        description:
          'Complete el archivo y vuelva a cargarlo para agregar destinatarios.',
      }
    );

  };



  /* =========================================================
     CARGAR CSV / EXCEL
  ========================================================= */

  const handleCSVUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    const file =
      e.target.files?.[0];


    if (!file) {
      return;
    }


    const fileExtension =
      file.name
        .split('.')
        .pop()
        ?.toLowerCase();



    /* ================= CSV ================= */

    if (
      fileExtension === 'csv'
    ) {

      const reader =
        new FileReader();


      reader.onload = (
        event
      ) => {

        const csv =
          event.target
            ?.result as string;


        const lines =
          csv.split('\n');


        if (
          lines.length < 2
        ) {

          toast.error(
            'El archivo está vacío o no es válido'
          );

          return;

        }


        const headers =
          lines[0]
            .split(',')
            .map(
              (header) =>
                header
                  .trim()
                  .toLowerCase()
            );


        const hasName =
          headers.some(
            (header) =>
              nameFields.some(
                (field) =>
                  header.includes(
                    field
                  )
              )
          );


        if (!hasName) {

          toast.error(
            'Falta la columna de nombre',
            {
              description:
                'El archivo debe contener una columna de nombre.',
            }
          );

          return;

        }


        const newRecipients:
          Recipient[] = [];


        for (
          let i = 1;
          i < lines.length;
          i++
        ) {

          const values =
            lines[i]
              .split(',')
              .map(
                (value) =>
                  value.trim()
              );


          if (
            values.length <
              headers.length ||
            !values.some(Boolean)
          ) {

            continue;

          }


          const recipient:
            Recipient = {
              name: '',
            };


          headers.forEach(
            (
              header,
              index
            ) => {

              const normalized =
                header
                  .toLowerCase()
                  .trim();


              if (
                nameFields.some(
                  (field) =>
                    normalized.includes(
                      field
                    )
                )
              ) {

                recipient.name =
                  values[index] ||
                  '';

              }


              if (
                emailFields.some(
                  (field) =>
                    normalized.includes(
                      field
                    )
                ) &&
                values[index]
              ) {

                recipient.email =
                  values[index];

              }

            }
          );


          if (
            recipient.name
          ) {

            recipient.uuid =
              uuidv4();


            newRecipients.push(
              recipient
            );

          }

        }


        setRecipients(
          newRecipients
        );


        toast.success(
          'Archivo CSV cargado',
          {
            description:
              `${newRecipients.length} destinatarios cargados correctamente.`,
          }
        );

      };


      reader.readAsText(
        file
      );

    }



    /* ================= EXCEL ================= */

    else if (
      fileExtension === 'xlsx' ||
      fileExtension === 'xls'
    ) {

      const reader =
        new FileReader();


      reader.onload = (
        event
      ) => {

        const data =
          new Uint8Array(
            event.target
              ?.result as ArrayBuffer
          );


        const workbook =
          XLSX.read(
            data,
            {
              type: 'array',
            }
          );


        const firstSheetName =
          workbook.SheetNames[0];


        const worksheet =
          workbook.Sheets[
            firstSheetName
          ];


        const jsonData =
          XLSX.utils.sheet_to_json(
            worksheet,
            {
              header: 1,
            }
          ) as unknown[][];


        if (
          jsonData.length < 2
        ) {

          toast.error(
            'Archivo Excel inválido',
            {
              description:
                'Debe contener encabezados y al menos un destinatario.',
            }
          );

          return;

        }


        const headers =
          jsonData[0].map(
            (value) =>
              String(value)
                .trim()
                .toLowerCase()
          );


        const hasName =
          headers.some(
            (header) =>
              nameFields.some(
                (field) =>
                  header.includes(
                    field
                  )
              )
          );


        if (!hasName) {

          toast.error(
            'Falta la columna de nombre',
            {
              description:
                'El archivo debe contener una columna de nombre.',
            }
          );

          return;

        }


        const newRecipients:
          Recipient[] = [];


        for (
          let i = 1;
          i <
          jsonData.length;
          i++
        ) {

          const values =
            jsonData[i].map(
              (value) =>
                String(
                  value || ''
                ).trim()
            );


          if (
            values.length <
              headers.length ||
            !values.some(Boolean)
          ) {

            continue;

          }


          const recipient:
            Recipient = {
              name: '',
            };


          headers.forEach(
            (
              header,
              index
            ) => {

              const normalized =
                header
                  .toLowerCase()
                  .trim();


              if (
                nameFields.some(
                  (field) =>
                    normalized.includes(
                      field
                    )
                )
              ) {

                recipient.name =
                  values[index] ||
                  '';

              }


              if (
                emailFields.some(
                  (field) =>
                    normalized.includes(
                      field
                    )
                ) &&
                values[index]
              ) {

                recipient.email =
                  values[index];

              }

            }
          );


          if (
            recipient.name
          ) {

            recipient.uuid =
              uuidv4();


            newRecipients.push(
              recipient
            );

          }

        }


        setRecipients(
          newRecipients
        );


        toast.success(
          'Archivo Excel cargado',
          {
            description:
              `${newRecipients.length} destinatarios cargados correctamente.`,
          }
        );

      };


      reader.readAsArrayBuffer(
        file
      );

    }



    /* ================= ERROR ================= */

    else {

      toast.error(
        'Formato no compatible',
        {
          description:
            'Seleccione un archivo CSV, XLSX o XLS.',
        }
      );

    }


    e.target.value = '';

  };



  /* =========================================================
     GENERAR CERTIFICADOS
  ========================================================= */

  const handleGenerateCertificates =
    async () => {

      if (
        !selectedCertificate ||
        recipients.length === 0 ||
        !certificateConfig
      ) {

        toast(
          'Información incompleta',
          {
            description:
              'Seleccione un certificado y agregue destinatarios.',
          }
        );

        return;

      }


      setIsGenerating(
        true
      );


      try {

        const certificate =
          certificates.find(
            (item) =>
              item.id ===
              selectedCertificate
          );


        if (!certificate) {

          throw new Error(
            'No se encontró el certificado'
          );

        }


        const imageUrl =
          getFullImageUrl(
            certificate.image
          );


        const generatedUrls:
          string[] = [];



        for (
          let i = 0;
          i <
          recipients.length;
          i++
        ) {

          const recipient =
            recipients[i];


          const canvas =
            document.createElement(
              'canvas'
            );


          const ctx =
            canvas.getContext(
              '2d'
            );


          if (!ctx) {

            throw new Error(
              'No se pudo inicializar el lienzo'
            );

          }


          const img =
            new window.Image();


          img.crossOrigin =
            'anonymous';


          await new Promise(
            (
              resolve,
              reject
            ) => {

              img.onload = () =>
                resolve(
                  undefined
                );


              img.onerror = () =>
                reject(
                  new Error(
                    'No se pudo cargar la plantilla'
                  )
                );


              img.src =
                imageUrl;

            }
          );


          canvas.width =
            img.width;


          canvas.height =
            img.height;


          ctx.drawImage(
            img,
            0,
            0
          );



          /* ================================================
             ESTILO DE CAMPOS
          ================================================ */

          const applyRuleBasedStyling = (

            fieldType: string,

            basePosition: {
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

          ) => {

            const position = {
              ...basePosition,
            };


            switch (
              fieldType
            ) {

              case 'recipientName':

                if (
                  !position.fontWeight
                ) {

                  position.fontWeight =
                    'bold';

                }


                if (
                  !position.fontFamily
                ) {

                  position.fontFamily =
                    'Montserrat';

                }


                break;



              case 'organisationName':

                if (
                  !position.fontFamily
                ) {

                  position.fontFamily =
                    'Inter';

                }

                break;



              case 'certificateLink':

                if (
                  !position.fontFamily
                ) {

                  position.fontFamily =
                    'Open Sans';

                }


                if (
                  !position.textDecoration
                ) {

                  position.textDecoration =
                    'underline';

                }

                break;



              case 'certificateQR':

                if (
                  !position.fontFamily
                ) {

                  position.fontFamily =
                    'Inter';

                }

                break;

            }


            if (
              !position.color
            ) {

              position.color =
                '#000000';

            }


            return position;

          };



          /* ================================================
             DIBUJAR TEXTO
          ================================================ */

          const drawCenteredText = (

            text: string,

            position: {
              x: number;
              y: number;
              width: number;
              height: number;
              fontFamily?: string;
              fontWeight?: string;
              fontStyle?: string;
              textDecoration?: string;
              color?: string;
            },

            maxFontSize = 72,

            fieldType?: string

          ) => {

            const styledPosition =
              fieldType

                ? applyRuleBasedStyling(
                    fieldType,
                    position
                  )

                : position;


            const fontFamily =
              styledPosition.fontFamily ||
              'Inter';


            const fontWeight =
              styledPosition.fontWeight ||
              'normal';


            const fontStyle =
              styledPosition.fontStyle ||
              'normal';


            const textDecoration =
              styledPosition
                .textDecoration ||
              'none';


            const color =
              styledPosition.color ||
              '#000000';


            const avgCharWidthFactor =
              0.6;


            let fontSize =
              Math.min(

                position.width /
                  (
                    Math.max(
                      text.length,
                      1
                    ) *
                    avgCharWidthFactor
                  ),

                position.height *
                  0.8,

                maxFontSize

              );


            fontSize =
              Math.max(
                fontSize,
                8
              );


            ctx.font =
              `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;


            let textMetrics =
              ctx.measureText(
                text
              );


            const maxWidth =
              position.width *
              0.9;


            const maxHeight =
              position.height *
              0.8;


            if (
              textMetrics.width >
                maxWidth ||
              fontSize >
                maxHeight
            ) {

              const widthRatio =
                maxWidth /
                textMetrics.width;


              const heightRatio =
                maxHeight /
                fontSize;


              fontSize *=
                Math.min(
                  widthRatio,
                  heightRatio
                );


              ctx.font =
                `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;


              textMetrics =
                ctx.measureText(
                  text
                );

            }


            const textX =
              position.x +
              (
                position.width -
                textMetrics.width
              ) /
                2;


            const ascent =
              textMetrics
                .actualBoundingBoxAscent ||
              fontSize *
                0.7;


            const textY =
              position.y +
              (
                position.height +
                ascent
              ) /
                2;


            ctx.fillStyle =
              color;


            ctx.fillText(
              text,
              textX,
              textY
            );


            if (
              textDecoration ===
              'underline'
            ) {

              const underlineY =
                textY + 2;


              ctx.strokeStyle =
                color;


              ctx.beginPath();


              ctx.moveTo(
                textX,
                underlineY
              );


              ctx.lineTo(
                textX +
                  textMetrics.width,

                underlineY
              );


              ctx.lineWidth =
                Math.max(
                  1,
                  fontSize /
                    20
                );


              ctx.stroke();

            }

          };



          /* ================================================
             QR
          ================================================ */

          const drawQRCode =
            async (

              data: string,

              position: {
                x: number;
                y: number;
                width: number;
                height: number;
              }

            ) => {

              try {

                const qrDataUrl =
                  await QRCode.toDataURL(
                    data,
                    {
                      width:
                        Math.min(
                          position.width,
                          position.height
                        ),

                      margin: 1,

                      color: {
                        dark:
                          '#000000',

                        light:
                          '#FFFFFF',
                      },
                    }
                  );


                const qrImg =
                  new window.Image();


                await new Promise<void>(
                  (
                    resolve,
                    reject
                  ) => {

                    qrImg.onload =
                      () =>
                        resolve();


                    qrImg.onerror =
                      reject;


                    qrImg.src =
                      qrDataUrl;

                  }
                );


                const qrSize =
                  Math.min(
                    position.width,
                    position.height
                  ) *
                  0.8;


                const qrX =
                  position.x +
                  (
                    position.width -
                    qrSize
                  ) /
                    2;


                const qrY =
                  position.y +
                  (
                    position.height -
                    qrSize
                  ) /
                    2;


                ctx.drawImage(
                  qrImg,
                  qrX,
                  qrY,
                  qrSize,
                  qrSize
                );

              } catch (error) {

                console.error(
                  'Error al generar QR:',
                  error
                );


                drawCenteredText(

                  `[QR: ${data}]`,

                  position,

                  16,

                  'certificateQR'

                );

              }

            };



          /* ================================================
             NOMBRE
          ================================================ */

          if (
            certificateConfig
              .validFields
              .recipientName
          ) {

            drawCenteredText(

              recipient.name,

              certificateConfig
                .validFields
                .recipientName,

              100,

              'recipientName'

            );

          }



          /* ================================================
             INSTITUCIÓN
          ================================================ */

          if (
            certificateConfig
              .validFields
              .organisationName
          ) {

            let orgName =
              'Carrera de Turismo UMSA';


            try {

              const userDataString =
                localStorage.getItem(
                  'certinova_user'
                );


              if (
                userDataString
              ) {

                const userData =
                  JSON.parse(
                    userDataString
                  );


                if (
                  userData?.organisation
                ) {

                  orgName =
                    userData.organisation;

                }

              }

            } catch (error) {

              console.error(
                'Error al obtener organización:',
                error
              );

            }


            drawCenteredText(

              orgName,

              certificateConfig
                .validFields
                .organisationName,

              72,

              'organisationName'

            );

          }



          /* ================================================
             ENLACE
          ================================================ */

          if (
            certificateConfig
              .validFields
              .certificateLink &&
            recipient.uuid
          ) {

            drawCenteredText(

              recipient.uuid,

              certificateConfig
                .validFields
                .certificateLink,

              24,

              'certificateLink'

            );

          }



          /* ================================================
             QR
          ================================================ */

          if (
            certificateConfig
              .validFields
              .certificateQR &&
            recipient.uuid
          ) {

            await drawQRCode(

              `${BASE_URL}/verify/${recipient.uuid}`,

              certificateConfig
                .validFields
                .certificateQR

            );

          }



          /* ================================================
             EXPORTAR CANVAS
          ================================================ */

          let blob: Blob;


          try {

            blob =
              await new Promise<Blob>(
                (
                  resolve,
                  reject
                ) => {

                  canvas.toBlob(
                    (
                      result
                    ) => {

                      if (
                        result
                      ) {

                        resolve(
                          result
                        );

                      } else {

                        reject(
                          new Error(
                            'No se pudo generar el certificado'
                          )
                        );

                      }

                    },

                    'image/png'
                  );

                }
              );

          } catch {

            const response =
              await fetch(
                imageUrl
              );


            if (
              !response.ok
            ) {

              throw new Error(
                'No se pudo obtener la imagen'
              );

            }


            blob =
              await response.blob();

          }


          let dataUrl:
            string;


          try {

            dataUrl =
              canvas.toDataURL(
                'image/png'
              );

          } catch {

            dataUrl =
              await new Promise<string>(
                (
                  resolve,
                  reject
                ) => {

                  const reader =
                    new FileReader();


                  reader.onloadend =
                    () =>
                      resolve(
                        reader.result as string
                      );


                  reader.onerror =
                    () =>
                      reject(
                        new Error(
                          'Error al convertir la imagen'
                        )
                      );


                  reader.readAsDataURL(
                    blob
                  );

                }
              );

          }


          generatedUrls.push(
            dataUrl
          );

        }



        setGeneratedImages(
          generatedUrls
        );


        setGeneratedDataUrls(

          recipients.map(
            (
              recipient,
              index
            ) => ({

              recipientName:
                recipient.name,

              imageDataUrl:
                generatedUrls[
                  index
                ],

            })
          )

        );


        setIsGenerating(
          false
        );


        setGenerationComplete(
          true
        );



        let orgName:
          string | undefined;


        try {

          const userDataString =
            localStorage.getItem(
              'certinova_user'
            );


          if (
            userDataString
          ) {

            const userData =
              JSON.parse(
                userDataString
              );


            orgName =
              userData?.organisation;

          }

        } catch (error) {

          console.error(
            'Error al obtener organización:',
            error
          );

        }


        try {

          await certificateService
            .updateRecipientCount(
              orgName,
              recipients.length
            );

        } catch (error) {

          console.error(
            'Error actualizando destinatarios:',
            error
          );

        }


        setShowPasswordDialog(
          true
        );


        confetti({
          particleCount: 100,
          spread: 70,
          origin: {
            y: 0.6,
          },
        });


        toast.success(
          'Certificados generados',
          {
            description:
              `${recipients.length} certificados fueron generados correctamente.`,
          }
        );

      } catch (error) {

        console.error(
          'Error al generar certificados:',
          error
        );


        toast.error(
          error instanceof Error
            ? error.message
            : 'No se pudieron generar los certificados'
        );


        setIsGenerating(
          false
        );

      }

    };



  /* =========================================================
     CIFRAR Y GUARDAR
  ========================================================= */

  const handlePasswordConfirm =
    async (
      password: string
    ) => {

      if (
        !certificateConfig
      ) {

        return;

      }


      setIsStoringData(
        true
      );


      try {

        let generatedBy =
          '';


        const userDataString =
          localStorage.getItem(
            'certinova_user'
          );


        if (
          userDataString
        ) {

          const userData =
            JSON.parse(
              userDataString
            );


          generatedBy =
            userData?.id ||
            '';

        }


        if (
          !generatedBy ||
          !certificateConfig.id
        ) {

          throw new Error(
            'No se encontró el usuario o la configuración del certificado'
          );

        }


        const response =
          await certificateService
            .storeGeneratedCertificate({

              certificateId:
                certificateConfig.id,

              recipients,

              generatedBy,

              password,

            });


        if (
          response.success &&
          response.data?.id
        ) {

          setGeneratedCertificateId(
            response.data.id
          );

        }


        const cache =
          EncryptedCache
            .getInstance();


        cache.setPassword(
          password
        );


        cache.set(
          `certificate_${certificateConfig.id}`,

          recipients
        );


        toast.success(
          'Datos almacenados de forma segura',
          {
            description:
              'La información fue cifrada y almacenada correctamente.',
          }
        );

      } catch (error) {

        console.error(
          'Error almacenando datos:',
          error
        );


        toast.error(
          'No se pudieron almacenar los datos',
          {
            description:
              error instanceof Error
                ? error.message
                : 'Ocurrió un error inesperado.',
          }
        );

      } finally {

        setIsStoringData(
          false
        );


        setShowPasswordDialog(
          false
        );

      }

    };



  /* =========================================================
     EXPORTAR
  ========================================================= */

  const handleUnifiedExport =
    async (

      format:
        | 'pdf'
        | 'image',

      mode:
        | 'batch'
        | 'individual' =
        'batch'

    ) => {

      if (
        generatedDataUrls.length ===
        0
      ) {

        toast.error(
          'No existen certificados para descargar'
        );

        return;

      }


      try {

        const eventName =
          certificates.find(
            (item) =>
              item.id ===
              selectedCertificate
          )?.name;


        await exportCertificatesUnified({

          certificates:
            generatedDataUrls,

          exportFormat:
            format,

          pdfMode:
            mode,

          eventName,

        });


        toast.success(
          'Descarga iniciada'
        );

      } catch (error) {

        console.error(
          'Error exportando certificados:',
          error
        );


        toast.error(
          'No se pudieron exportar los certificados'
        );

      }

    };



  /* =========================================================
     REINICIAR
  ========================================================= */

  const resetModal = () => {

    setStep(1);

    setSelectedCertificate(
      ''
    );

    setRecipients([]);

    setManualName('');

    setManualEmail('');

    setIsGenerating(
      false
    );

    setGenerationComplete(
      false
    );

    setGeneratedDataUrls([]);

    setGeneratedImages([]);

    setGeneratedCertificateId(
      ''
    );

    setCertificateConfig(
      null
    );

    setEmailProgress({
      sent: 0,
      failed: 0,
      total: 0,
      status: 'idle',
      details: [],
    });

  };



  /* =========================================================
     ENVIAR CORREOS
  ========================================================= */

  const handleSendEmails =
    async () => {

      if (
        !generatedCertificateId
      ) {

        toast.error(
          'No se encontró el ID de los certificados generados'
        );

        return;

      }


      const recipientsWithEmail =
        recipients.filter(
          (recipient) =>
            recipient.email
        );


      if (
        recipientsWithEmail.length ===
        0
      ) {

        toast.error(
          'Ningún destinatario tiene correo electrónico'
        );

        return;

      }


      setStep(4);

      setIsSendingEmails(
        true
      );


      setEmailProgress({

        sent: 0,

        failed: 0,

        total:
          recipientsWithEmail.length,

        status:
          'sending',

        details:
          recipientsWithEmail.map(
            (recipient) => ({
              email:
                recipient.email!,
              status:
                'pending',
            })
          ),

      });


      const batchSize =
        5;


      let sentCount =
        0;


      let failedCount =
        0;


      for (
        let i = 0;
        i <
        recipientsWithEmail.length;
        i += batchSize
      ) {

        const batch =
          recipientsWithEmail.slice(
            i,
            i +
              batchSize
          );


        const payloadRecipients =
          batch.map(
            (
              recipient
            ) => {

              const originalIndex =
                recipients.findIndex(
                  (
                    original
                  ) =>
                    original ===
                    recipient
                );


              return {

                name:
                  recipient.name,

                email:
                  recipient.email!,

                uuid:
                  recipient.uuid,

                base64Image:
                  generatedImages[
                    originalIndex
                  ] ||
                  '',

              };

            }
          );


        try {

          const response =
            await certificateService
              .sendCertificateEmails({

                generatedCertificateId,

                recipients:
                  payloadRecipients,

              });


          if (
            response.success &&
            response.data
          ) {

            response.data.forEach(
              (
                result: {
                  email: string;
                  status:
                    | 'sent'
                    | 'failed';
                  error?: string;
                }
              ) => {

                if (
                  result.status ===
                  'sent'
                ) {

                  sentCount++;

                } else {

                  failedCount++;

                }


                setEmailProgress(
                  (prev) => ({

                    ...prev,

                    sent:
                      sentCount,

                    failed:
                      failedCount,

                    details:
                      prev.details.map(
                        (
                          detail
                        ) =>
                          detail.email ===
                          result.email

                            ? {
                                ...detail,

                                status:
                                  result.status,

                                error:
                                  result.error,
                              }

                            : detail
                      ),

                  })
                );

              }
            );

          }

        } catch (error) {

          console.error(
            'Error enviando correos:',
            error
          );


          failedCount +=
            batch.length;


          setEmailProgress(
            (prev) => ({

              ...prev,

              failed:
                failedCount,

              details:
                prev.details.map(
                  (
                    detail
                  ) =>
                    batch.some(
                      (
                        recipient
                      ) =>
                        recipient.email ===
                        detail.email
                    )

                      ? {
                          ...detail,

                          status:
                            'failed',

                          error:
                            'Error al enviar',
                        }

                      : detail
                ),

            })
          );

        }

      }


      setIsSendingEmails(
        false
      );


      setEmailProgress(
        (prev) => ({
          ...prev,
          status:
            'completed',
        })
      );


      if (
        failedCount === 0
      ) {

        toast.success(
          'Todos los correos fueron enviados'
        );

      } else {

        toast.warning(
          `${sentCount} enviados y ${failedCount} con error`
        );

      }

    };



  /* =========================================================
     CERRAR
  ========================================================= */

  const handleClose = () => {

    resetModal();

    onClose();

  };



  return (

    <Dialog
      open={open}
      onOpenChange={(
        isOpen
      ) => {

        if (!isOpen) {

          handleClose();

        }

      }}
    >

      <DialogContent
        className="
          max-h-[94vh]
          w-[95vw]
          max-w-5xl
          overflow-y-auto
          rounded-3xl
          border
          border-gray-100
          bg-white
          p-0
          shadow-2xl
          sm:max-w-5xl
        "
      >


        {/* =================================================
            CABECERA
        ================================================= */}

        <div
          className="
            relative
            overflow-hidden
            bg-gradient-to-br
            from-[#003874]
            via-[#004b91]
            to-[#00539c]
            px-6
            py-6
          "
        >

          <div
            className="
              absolute
              -right-14
              -top-20
              h-48
              w-48
              rounded-full
              bg-[#ffde32]/15
            "
          />


          <DialogHeader
            className="
              relative
              z-10
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
                rounded-2xl
                bg-[#ffde32]
                shadow-lg
              "
            >

              {step === 4 ? (

                <Mail
                  className="
                    h-6
                    w-6
                    text-[#003874]
                  "
                />

              ) : (

                <Send
                  className="
                    h-6
                    w-6
                    text-[#003874]
                  "
                />

              )}

            </div>


            <DialogTitle
              className="
                text-center
                text-2xl
                font-bold
                text-white
              "
            >

              {step === 4
                ? 'Estado de envío'
                : 'Generar certificados'
              }

            </DialogTitle>


            {step !== 4 && (

              <p
                className="
                  mt-2
                  text-center
                  text-sm
                  text-blue-100
                "
              >

                Seleccione el certificado,
                agregue los destinatarios
                y genere los documentos.

              </p>

            )}

          </DialogHeader>



          {step !== 4 && (

            <div
              className="
                relative
                z-10
                mx-auto
                mt-5
                flex
                max-w-md
                items-center
                gap-2
              "
            >

              {[1, 2, 3].map(
                (
                  item
                ) => (

                  <div
                    key={
                      item
                    }
                    className="
                      flex
                      flex-1
                      items-center
                      gap-2
                    "
                  >

                    <div
                      className={`
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        text-xs
                        font-bold
                        ${
                          step >= item

                            ? `
                              bg-[#ffde32]
                              text-[#003874]
                            `

                            : `
                              bg-white/15
                              text-white
                            `
                        }
                      `}
                    >

                      {item}

                    </div>


                    {item < 3 && (

                      <div
                        className={`
                          h-0.5
                          flex-1
                          rounded-full
                          ${
                            step >
                            item

                              ? 'bg-[#ffde32]'

                              : 'bg-white/20'
                          }
                        `}
                      />

                    )}

                  </div>

                )
              )}

            </div>

          )}

        </div>



        <div
          className="
            px-5
            pb-6
            sm:px-7
          "
        >

          <AnimatePresence
            mode="wait"
          >


            {/* =================================================
                PASO 1
            ================================================= */}

            {step === 1 && (

              <motion.div

                key="step1"

                initial={{
                  opacity: 0,
                  x: 20,
                }}

                animate={{
                  opacity: 1,
                  x: 0,
                }}

                exit={{
                  opacity: 0,
                  x: -20,
                }}

                className="
                  space-y-6
                  py-6
                "
              >

                <div
                  className="
                    text-center
                  "
                >

                  <h3
                    className="
                      text-xl
                      font-bold
                      text-[#003874]
                    "
                  >

                    Seleccione un certificado

                  </h3>


                  <p
                    className="
                      mt-1
                      text-sm
                      text-gray-500
                    "
                  >

                    Seleccione la plantilla que
                    utilizará para generar los certificados.

                  </p>

                </div>



                <div
                  className="
                    grid
                    grid-cols-1
                    gap-4
                    md:grid-cols-2
                  "
                >

                  {certificates.map(
                    (
                      certificate
                    ) => (

                      <Card

                        key={
                          certificate.id
                        }

                        onClick={() =>
                          setSelectedCertificate(
                            certificate.id
                          )
                        }

                        className={`
                          cursor-pointer
                          overflow-hidden
                          rounded-2xl
                          border-2
                          transition-all
                          duration-300
                          ${
                            selectedCertificate ===
                            certificate.id

                              ? `
                                border-[#003874]
                                bg-[#f8fbff]
                                shadow-lg
                                shadow-[#003874]/10
                              `

                              : `
                                border-gray-100
                                bg-white
                                hover:-translate-y-1
                                hover:border-[#003874]/20
                                hover:shadow-md
                              `
                          }
                        `}
                      >

                        <CardContent
                          className="
                            p-4
                          "
                        >

                          <div
                            className="
                              relative
                              mb-4
                              flex
                              aspect-video
                              items-center
                              justify-center
                              overflow-hidden
                              rounded-xl
                              border
                              border-gray-100
                              bg-gray-50
                            "
                          >

                            {certificate.image ? (

                              <Image

                                src={
                                  certificate.image
                                }

                                alt={
                                  certificate.name
                                }

                                width={
                                  300
                                }

                                height={
                                  170
                                }

                                className="
                                  h-full
                                  w-full
                                  object-cover
                                "

                                unoptimized
                              />

                            ) : (

                              <Award
                                className="
                                  h-12
                                  w-12
                                  text-[#003874]/30
                                "
                              />

                            )}


                            {selectedCertificate ===
                              certificate.id && (

                              <div
                                className="
                                  absolute
                                  right-3
                                  top-3
                                  flex
                                  h-8
                                  w-8
                                  items-center
                                  justify-center
                                  rounded-full
                                  bg-[#ffde32]
                                  shadow-md
                                "
                              >

                                <CheckCircle
                                  className="
                                    h-5
                                    w-5
                                    text-[#003874]
                                  "
                                />

                              </div>

                            )}

                          </div>


                          <h4
                            className="
                              font-bold
                              text-[#003874]
                            "
                          >

                            {
                              certificate.name
                            }

                          </h4>


                          <p
                            className="
                              mt-1
                              text-sm
                              text-gray-500
                            "
                          >

                            {
                              certificate.event
                            }

                          </p>


                          <Badge
                            className="
                              mt-3
                              bg-[#eef5ff]
                              text-[#003874]
                              hover:bg-[#eef5ff]
                            "
                          >

                            {
                              certificate.date
                            }

                          </Badge>

                        </CardContent>

                      </Card>

                    )
                  )}

                </div>



                {certificates.length ===
                  0 && (

                  <div
                    className="
                      rounded-2xl
                      border-2
                      border-dashed
                      border-[#003874]/15
                      bg-[#f8fbff]
                      py-12
                      text-center
                    "
                  >

                    <Award
                      className="
                        mx-auto
                        mb-4
                        h-14
                        w-14
                        text-[#003874]/30
                      "
                    />


                    <p
                      className="
                        font-semibold
                        text-[#003874]
                      "
                    >

                      No hay certificados disponibles

                    </p>


                    <p
                      className="
                        mt-1
                        text-sm
                        text-gray-400
                      "
                    >

                      Primero debe crear y configurar
                      un certificado.

                    </p>

                  </div>

                )}



                <Button

                  onClick={() =>
                    setStep(2)
                  }

                  disabled={
                    !selectedCertificate
                  }

                  className="
                    h-12
                    w-full
                    rounded-xl
                    bg-[#003874]
                    font-bold
                    text-white
                    shadow-md
                    transition-all
                    hover:-translate-y-0.5
                    hover:bg-[#002b59]
                  "
                >

                  Continuar

                </Button>

              </motion.div>

            )}



            {/* =================================================
                PASO 2
            ================================================= */}

            {step === 2 && (

              <motion.div

                key="step2"

                initial={{
                  opacity: 0,
                  x: 20,
                }}

                animate={{
                  opacity: 1,
                  x: 0,
                }}

                exit={{
                  opacity: 0,
                  x: -20,
                }}

                className="
                  space-y-6
                  py-6
                "
              >

                <div
                  className="
                    text-center
                  "
                >

                  <h3
                    className="
                      text-xl
                      font-bold
                      text-[#003874]
                    "
                  >

                    Agregar destinatarios

                  </h3>


                  <p
                    className="
                      mt-1
                      text-sm
                      text-gray-500
                    "
                  >

                    Ingrese los datos manualmente
                    o cargue un archivo CSV o Excel.

                  </p>

                </div>



                {selectedCertificate && (

                  <div
                    className="
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      border
                      border-[#003874]/10
                      bg-[#eef5ff]
                      p-4
                    "
                  >

                    <Award
                      className="
                        h-5
                        w-5
                        text-[#003874]
                      "
                    />


                    <div>

                      <p
                        className="
                          text-xs
                          text-gray-500
                        "
                      >

                        Certificado seleccionado

                      </p>


                      <p
                        className="
                          text-sm
                          font-bold
                          text-[#003874]
                        "
                      >

                        {
                          certificates.find(
                            (
                              certificate
                            ) =>
                              certificate.id ===
                              selectedCertificate
                          )?.name
                        }

                      </p>

                    </div>

                  </div>

                )}



                <Tabs
                  defaultValue="manual"
                >

                  <TabsList
                    className="
                      grid
                      w-full
                      grid-cols-2
                      rounded-xl
                      bg-[#eef5ff]
                      p-1
                    "
                  >

                    <TabsTrigger
                      value="manual"
                      className="
                        rounded-lg
                        font-semibold
                        text-[#003874]
                        data-[state=active]:bg-[#003874]
                        data-[state=active]:text-white
                      "
                    >

                      Ingreso manual

                    </TabsTrigger>


                    <TabsTrigger
                      value="csv"
                      className="
                        rounded-lg
                        font-semibold
                        text-[#003874]
                        data-[state=active]:bg-[#003874]
                        data-[state=active]:text-white
                      "
                    >

                      Cargar archivo

                    </TabsTrigger>

                  </TabsList>



                  {/* MANUAL */}

                  <TabsContent
                    value="manual"
                    className="
                      mt-4
                    "
                  >

                    <Card
                      className="
                        rounded-2xl
                        border-gray-100
                        shadow-sm
                      "
                    >

                      <CardHeader>

                        <CardTitle
                          className="
                            flex
                            items-center
                            text-sm
                            font-bold
                            text-[#003874]
                          "
                        >

                          <User
                            className="
                              mr-2
                              h-4
                              w-4
                            "
                          />

                          Agregar destinatario

                        </CardTitle>

                      </CardHeader>


                      <CardContent
                        className="
                          space-y-4
                        "
                      >

                        <div
                          className="
                            grid
                            grid-cols-1
                            gap-4
                            md:grid-cols-2
                          "
                        >

                          <div
                            className="
                              space-y-2
                            "
                          >

                            <Label
                              htmlFor="manualName"
                              className="
                                font-semibold
                                text-[#003874]
                              "
                            >

                              Nombre *

                            </Label>


                            <Input

                              id="manualName"

                              value={
                                manualName
                              }

                              onChange={(e) =>
                                setManualName(
                                  e.target.value
                                )
                              }

                              placeholder="Ej.: Juan Pérez"

                              className="
                                h-11
                                rounded-xl
                                border-gray-200
                                focus-visible:ring-[#003874]
                              "
                            />

                          </div>



                          <div
                            className="
                              space-y-2
                            "
                          >

                            <Label
                              htmlFor="manualEmail"
                              className="
                                font-semibold
                                text-[#003874]
                              "
                            >

                              Correo electrónico

                              <span
                                className="
                                  ml-1
                                  font-normal
                                  text-gray-400
                                "
                              >

                                (opcional)

                              </span>

                            </Label>


                            <Input

                              id="manualEmail"

                              type="email"

                              value={
                                manualEmail
                              }

                              onChange={(e) =>
                                setManualEmail(
                                  e.target.value
                                )
                              }

                              placeholder="correo@ejemplo.com"

                              className="
                                h-11
                                rounded-xl
                                border-gray-200
                                focus-visible:ring-[#003874]
                              "
                            />

                          </div>

                        </div>


                        <Button

                          onClick={
                            handleAddManualRecipient
                          }

                          className="
                            h-11
                            w-full
                            rounded-xl
                            bg-[#003874]
                            font-semibold
                            text-white
                            hover:bg-[#002b59]
                          "
                        >

                          Agregar destinatario

                        </Button>

                      </CardContent>

                    </Card>

                  </TabsContent>



                  {/* ARCHIVO */}

                  <TabsContent
                    value="csv"
                    className="
                      mt-4
                    "
                  >

                    <Card
                      className="
                        rounded-2xl
                        border-gray-100
                        shadow-sm
                      "
                    >

                      <CardHeader>

                        <CardTitle
                          className="
                            flex
                            items-center
                            text-sm
                            font-bold
                            text-[#003874]
                          "
                        >

                          <FileSpreadsheet
                            className="
                              mr-2
                              h-4
                              w-4
                            "
                          />

                          Cargar archivo CSV o Excel

                        </CardTitle>

                      </CardHeader>


                      <CardContent
                        className="
                          space-y-4
                        "
                      >

                        <div
                          className="
                            flex
                            flex-col
                            gap-3
                            rounded-xl
                            border
                            border-[#ffde32]
                            bg-[#fffbed]
                            p-4
                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                          "
                        >

                          <div>

                            <p
                              className="
                                text-sm
                                font-bold
                                text-[#003874]
                              "
                            >

                              Archivo de ejemplo

                            </p>


                            <p
                              className="
                                mt-1
                                text-xs
                                text-gray-500
                              "
                            >

                              Descargue el archivo,
                              complete los datos y
                              vuelva a cargarlo.

                            </p>

                          </div>


                          <Button

                            size="sm"

                            variant="outline"

                            onClick={
                              handleDownloadSample
                            }

                            className="
                              rounded-xl
                              border-[#003874]/20
                              bg-white
                              text-[#003874]
                              hover:bg-[#ffde32]
                              hover:text-[#003874]
                            "
                          >

                            <FileDown
                              className="
                                mr-2
                                h-4
                                w-4
                              "
                            />

                            Descargar

                          </Button>

                        </div>



                        <div
                          className="
                            rounded-2xl
                            border-2
                            border-dashed
                            border-[#003874]/20
                            bg-[#f8fbff]
                            p-8
                            text-center
                            transition-all
                            hover:border-[#003874]
                            hover:bg-[#eef5ff]
                          "
                        >

                          <input
                            id="csvUpload"
                            type="file"
                            accept=".csv,.xlsx,.xls"
                            onChange={
                              handleCSVUpload
                            }
                            className="hidden"
                          />


                          <label
                            htmlFor="csvUpload"
                            className="
                              block
                              cursor-pointer
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

                              Seleccionar archivo

                            </p>


                            <p
                              className="
                                mt-1
                                text-xs
                                text-gray-500
                              "
                            >

                              Columnas esperadas:
                              nombre y correo electrónico.

                            </p>


                            <p
                              className="
                                mt-1
                                text-xs
                                text-gray-400
                              "
                            >

                              .csv, .xlsx o .xls

                            </p>

                          </label>

                        </div>

                      </CardContent>

                    </Card>

                  </TabsContent>

                </Tabs>



                {/* LISTA */}

                {recipients.length >
                  0 && (

                  <Card
                    className="
                      rounded-2xl
                      border-gray-100
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
                          flex
                          items-center
                          justify-between
                          text-sm
                          font-bold
                          text-[#003874]
                        "
                      >

                        Destinatarios


                        <Badge
                          className="
                            bg-[#ffde32]
                            text-[#003874]
                            hover:bg-[#ffde32]
                          "
                        >

                          {recipients.length}

                        </Badge>

                      </CardTitle>

                    </CardHeader>


                    <CardContent>

                      <div
                        className="
                          max-h-52
                          space-y-2
                          overflow-y-auto
                        "
                      >

                        {recipients.map(
                          (
                            recipient,
                            index
                          ) => (

                            <div
                              key={
                                recipient.uuid ||
                                index
                              }
                              className="
                                flex
                                items-center
                                justify-between
                                gap-3
                                rounded-xl
                                border
                                border-gray-100
                                bg-[#f8fbff]
                                p-3
                              "
                            >

                              <div
                                className="
                                  min-w-0
                                  flex-1
                                "
                              >

                                <p
                                  className="
                                    truncate
                                    text-sm
                                    font-semibold
                                    text-[#003874]
                                  "
                                >

                                  {
                                    recipient.name
                                  }

                                </p>


                                {recipient.email && (

                                  <p
                                    className="
                                      mt-0.5
                                      truncate
                                      text-xs
                                      text-gray-500
                                    "
                                  >

                                    {
                                      recipient.email
                                    }

                                  </p>

                                )}

                              </div>


                              <Button

                                size="sm"

                                variant="ghost"

                                onClick={() =>
                                  setRecipients(
                                    (
                                      prev
                                    ) =>
                                      prev.filter(
                                        (
                                          _,
                                          i
                                        ) =>
                                          i !==
                                          index
                                      )
                                  )
                                }

                                className="
                                  h-8
                                  w-8
                                  rounded-lg
                                  p-0
                                  text-gray-400
                                  hover:bg-red-50
                                  hover:text-red-600
                                "
                              >

                                <X
                                  className="
                                    h-4
                                    w-4
                                  "
                                />

                              </Button>

                            </div>

                          )
                        )}

                      </div>

                    </CardContent>

                  </Card>

                )}



                <div
                  className="
                    flex
                    gap-3
                  "
                >

                  <Button

                    variant="outline"

                    onClick={() =>
                      setStep(1)
                    }

                    className="
                      h-11
                      flex-1
                      rounded-xl
                      border-[#003874]/20
                      bg-white
                      font-semibold
                      text-[#003874]
                      hover:bg-[#eef5ff]
                      hover:text-[#003874]
                    "
                  >

                    Volver

                  </Button>


                  <Button

                    onClick={() =>
                      setStep(3)
                    }

                    disabled={
                      recipients.length ===
                      0
                    }

                    className="
                      h-11
                      flex-1
                      rounded-xl
                      bg-[#003874]
                      font-semibold
                      text-white
                      hover:bg-[#002b59]
                    "
                  >

                    Continuar

                  </Button>

                </div>

              </motion.div>

            )}



            {/* =================================================
                PASO 3
            ================================================= */}

            {step === 3 && (

              <motion.div

                key="step3"

                initial={{
                  opacity: 0,
                  x: 20,
                }}

                animate={{
                  opacity: 1,
                  x: 0,
                }}

                exit={{
                  opacity: 0,
                  x: -20,
                }}

                className="
                  space-y-6
                  py-6
                "
              >

                <div
                  className="
                    text-center
                  "
                >

                  <div
                    className={`
                      mx-auto
                      mb-4
                      flex
                      h-16
                      w-16
                      items-center
                      justify-center
                      rounded-2xl
                      ${
                        generationComplete
                          ? 'bg-[#ffde32]'
                          : 'bg-[#eef5ff]'
                      }
                    `}
                  >

                    {generationComplete ? (

                      <CheckCircle
                        className="
                          h-8
                          w-8
                          text-[#003874]
                        "
                      />

                    ) : isGenerating ? (

                      <Loader2
                        className="
                          h-8
                          w-8
                          animate-spin
                          text-[#003874]
                        "
                      />

                    ) : (

                      <Award
                        className="
                          h-8
                          w-8
                          text-[#003874]
                        "
                      />

                    )}

                  </div>


                  <h3
                    className="
                      text-xl
                      font-bold
                      text-[#003874]
                    "
                  >

                    {generationComplete
                      ? 'Certificados generados'
                      : 'Generar certificados'
                    }

                  </h3>


                  <p
                    className="
                      mt-1
                      text-sm
                      text-gray-500
                    "
                  >

                    {generationComplete

                      ? 'Los certificados están listos para descargar.'

                      : 'Revise la información antes de iniciar la generación.'
                    }

                  </p>

                </div>



                <Card
                  className="
                    rounded-2xl
                    border-[#003874]/10
                    bg-[#f8fbff]
                    shadow-sm
                  "
                >

                  <CardHeader>

                    <CardTitle
                      className="
                        text-sm
                        font-bold
                        text-[#003874]
                      "
                    >

                      Resumen

                    </CardTitle>

                  </CardHeader>


                  <CardContent
                    className="
                      space-y-4
                    "
                  >

                    <div
                      className="
                        flex
                        justify-between
                        gap-4
                        border-b
                        border-gray-100
                        pb-3
                      "
                    >

                      <span
                        className="
                          text-sm
                          text-gray-500
                        "
                      >

                        Certificado

                      </span>


                      <span
                        className="
                          text-right
                          text-sm
                          font-semibold
                          text-[#003874]
                        "
                      >

                        {
                          certificates.find(
                            (
                              certificate
                            ) =>
                              certificate.id ===
                              selectedCertificate
                          )?.name
                        }

                      </span>

                    </div>


                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-4
                        border-b
                        border-gray-100
                        pb-3
                      "
                    >

                      <span
                        className="
                          text-sm
                          text-gray-500
                        "
                      >

                        Destinatarios

                      </span>


                      <Badge
                        className="
                          bg-[#ffde32]
                          text-[#003874]
                          hover:bg-[#ffde32]
                        "
                      >

                        {
                          recipients.length
                        }

                      </Badge>

                    </div>


                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-4
                      "
                    >

                      <span
                        className="
                          text-sm
                          text-gray-500
                        "
                      >

                        Estado

                      </span>


                      <Badge
                        variant="outline"
                        className={`
                          ${
                            generationComplete

                              ? `
                                border-green-200
                                bg-green-50
                                text-green-700
                              `

                              : isGenerating

                                ? `
                                  border-[#003874]/20
                                  bg-[#eef5ff]
                                  text-[#003874]
                                `

                                : `
                                  border-gray-200
                                  bg-white
                                  text-gray-600
                                `
                          }
                        `}
                      >

                        {generationComplete

                          ? 'Completado'

                          : isGenerating

                            ? 'Procesando...'

                            : 'Listo'
                        }

                      </Badge>

                    </div>

                  </CardContent>

                </Card>



                {!generationComplete && (

                  <div
                    className="
                      space-y-3
                    "
                  >

                    <Button

                      variant="outline"

                      onClick={() =>
                        setStep(2)
                      }

                      className="
                        h-11
                        w-full
                        rounded-xl
                        border-[#003874]/20
                        bg-white
                        font-semibold
                        text-[#003874]
                        hover:bg-[#eef5ff]
                        hover:text-[#003874]
                      "
                    >

                      Volver

                    </Button>


                    <Button

                      onClick={
                        handleGenerateCertificates
                      }

                      disabled={
                        isGenerating
                      }

                      className="
                        h-12
                        w-full
                        rounded-xl
                        bg-[#003874]
                        font-bold
                        text-white
                        shadow-md
                        hover:bg-[#002b59]
                      "
                    >

                      {isGenerating ? (

                        <>
                          <Loader2
                            className="
                              mr-2
                              h-4
                              w-4
                              animate-spin
                            "
                          />

                          Generando...

                        </>

                      ) : (

                        <>
                          <Award
                            className="
                              mr-2
                              h-4
                              w-4
                            "
                          />

                          Generar certificados

                        </>

                      )}

                    </Button>

                  </div>

                )}



                {generationComplete && (

                  <div
                    className="
                      space-y-4
                    "
                  >

                    <div
                      className="
                        grid
                        grid-cols-1
                        gap-3
                        md:grid-cols-3
                      "
                    >

                      <Button

                        onClick={() =>
                          handleUnifiedExport(
                            'image'
                          )
                        }

                        className="
                          h-11
                          rounded-xl
                          bg-[#003874]
                          font-semibold
                          text-white
                          hover:bg-[#002b59]
                        "
                      >

                        <Download
                          className="
                            mr-2
                            h-4
                            w-4
                          "
                        />

                        Descargar imágenes

                      </Button>



                      <Button

                        onClick={() =>
                          handleUnifiedExport(
                            'pdf',
                            'batch'
                          )
                        }

                        className="
                          h-11
                          rounded-xl
                          bg-[#ffde32]
                          font-bold
                          text-[#003874]
                          hover:bg-[#f5d000]
                          hover:text-[#003874]
                        "
                      >

                        <FileText
                          className="
                            mr-2
                            h-4
                            w-4
                          "
                        />

                        PDF conjunto

                      </Button>



                      <Button

                        onClick={() =>
                          handleUnifiedExport(
                            'pdf',
                            'individual'
                          )
                        }

                        variant="outline"

                        className="
                          h-11
                          rounded-xl
                          border-[#003874]
                          bg-white
                          font-semibold
                          text-[#003874]
                          hover:bg-[#eef5ff]
                          hover:text-[#003874]
                        "
                      >

                        <FileDown
                          className="
                            mr-2
                            h-4
                            w-4
                          "
                        />

                        PDF individuales

                      </Button>

                    </div>



                    <Button

                      variant="outline"

                      onClick={
                        handleClose
                      }

                      className="
                        h-11
                        w-full
                        rounded-xl
                        border-gray-200
                        bg-white
                        font-semibold
                        text-gray-600
                        hover:bg-gray-50
                      "
                    >

                      Cerrar

                    </Button>

                  </div>

                )}

              </motion.div>

            )}



            {/* =================================================
                PASO 4
            ================================================= */}

            {step === 4 && (

              <motion.div

                key="step4"

                initial={{
                  opacity: 0,
                  x: 20,
                }}

                animate={{
                  opacity: 1,
                  x: 0,
                }}

                exit={{
                  opacity: 0,
                  x: -20,
                }}

                className="
                  space-y-6
                  py-6
                "
              >

                <div
                  className="
                    text-center
                  "
                >

                  <div
                    className="
                      mx-auto
                      mb-4
                      flex
                      h-16
                      w-16
                      items-center
                      justify-center
                      rounded-2xl
                      bg-[#eef5ff]
                    "
                  >

                    {emailProgress.status ===
                    'completed' ? (

                      <CheckCircle
                        className="
                          h-8
                          w-8
                          text-[#003874]
                        "
                      />

                    ) : (

                      <Loader2
                        className="
                          h-8
                          w-8
                          animate-spin
                          text-[#003874]
                        "
                      />

                    )}

                  </div>


                  <h3
                    className="
                      text-xl
                      font-bold
                      text-[#003874]
                    "
                  >

                    {emailProgress.status ===
                    'completed'

                      ? 'Envío finalizado'

                      : 'Enviando correos...'
                    }

                  </h3>


                  <p
                    className="
                      mt-2
                      text-sm
                      text-gray-500
                    "
                  >

                    {emailProgress.sent}

                    {' '}de{' '}

                    {emailProgress.total}

                    {' '}enviados.

                    {' '}

                    {emailProgress.failed}

                    {' '}con error.

                  </p>

                </div>



                <Card
                  className="
                    rounded-2xl
                    border-gray-100
                    shadow-sm
                  "
                >

                  <CardHeader>

                    <CardTitle
                      className="
                        text-sm
                        font-bold
                        text-[#003874]
                      "
                    >

                      Estado de los envíos

                    </CardTitle>

                  </CardHeader>


                  <CardContent>

                    <div
                      className="
                        max-h-60
                        space-y-2
                        overflow-y-auto
                      "
                    >

                      {emailProgress.details.map(
                        (
                          detail,
                          index
                        ) => (

                          <div
                            key={
                              index
                            }
                            className="
                              flex
                              items-center
                              justify-between
                              gap-3
                              rounded-xl
                              border
                              border-gray-100
                              bg-[#f8fbff]
                              p-3
                            "
                          >

                            <span
                              className="
                                truncate
                                text-sm
                                font-medium
                                text-[#003874]
                              "
                            >

                              {
                                detail.email
                              }

                            </span>


                            <Badge
                              className={`
                                ${
                                  detail.status ===
                                  'sent'

                                    ? `
                                      bg-green-100
                                      text-green-700
                                    `

                                    : detail.status ===
                                      'failed'

                                      ? `
                                        bg-red-100
                                        text-red-700
                                      `

                                      : `
                                        bg-[#eef5ff]
                                        text-[#003874]
                                      `
                                }
                              `}
                            >

                              {detail.status ===
                              'sent'

                                ? 'Enviado'

                                : detail.status ===
                                  'failed'

                                  ? 'Error'

                                  : 'Pendiente'
                              }

                            </Badge>

                          </div>

                        )
                      )}

                    </div>

                  </CardContent>

                </Card>



                {emailProgress.status ===
                  'completed' && (

                  <Button

                    variant="outline"

                    onClick={
                      handleClose
                    }

                    className="
                      h-11
                      w-full
                      rounded-xl
                      border-[#003874]/20
                      bg-white
                      font-semibold
                      text-[#003874]
                      hover:bg-[#eef5ff]
                      hover:text-[#003874]
                    "
                  >

                    Finalizar

                  </Button>

                )}

              </motion.div>

            )}

          </AnimatePresence>

        </div>



        <PasswordDialog

          purpose="Encrypt"

          open={
            showPasswordDialog
          }

          onClose={() =>
            setShowPasswordDialog(
              false
            )
          }

          onConfirm={
            handlePasswordConfirm
          }

          title="Ingrese su contraseña"

          description="Ingrese su contraseña de inicio de sesión para cifrar y almacenar de forma segura la información de los certificados generados."

          isLoading={
            isStoringData
          }

        />

      </DialogContent>

    </Dialog>

  );

}