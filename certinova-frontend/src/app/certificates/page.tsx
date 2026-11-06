'use client';
import {
  useState,
  useMemo,
  useEffect,
  useCallback,
} from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Calendar as DatePickerCalendar,
} from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type {
  DateRange,
} from 'react-day-picker';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Search,
  Filter,
  Users,
  Calendar,
  FileText,
  Hash,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Lock,
  Unlock,
  X,
} from 'lucide-react';
import {
  certificateService,
} from '@/services/certificate';
import {
  CertificateListItem,
} from '@/types/certificate';
import { toast } from 'sonner';
import {
  PasswordDialog,
} from '@/components/password-dialog';
import {
  EncryptedCache,
} from '@/utils/crypto';
import {
  Navbar,
} from '@/components/navbar';
import {
  ProtectedRoute,
} from '@/components/ProtectedRoute';
import {
  useAuth,
} from '@/context/AuthContext';
export default function CertificatesPage() {
  const { user } = useAuth();
  const [
    searchTerm,
    setSearchTerm,
  ] = useState('');
  const [
    filterBy,
    setFilterBy,
  ] = useState('all');
  const [
    startDate,
    setStartDate,
  ] = useState('');
  const [
    endDate,
    setEndDate,
  ] = useState('');
  const [
    dateRange,
    setDateRange,
  ] = useState<
    DateRange | undefined
  >();
  const [
    selectedCertificate,
    setSelectedCertificate,
  ] = useState<
    CertificateListItem | null
  >(null);
  const [
    recipientSearchTerm,
    setRecipientSearchTerm,
  ] = useState('');
  const [
    certificates,
    setCertificates,
  ] = useState<
    CertificateListItem[]
  >([]);
  const [
    isLoading,
    setIsLoading,
  ] = useState(true);
  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);
  const [
    isDecrypted,
    setIsDecrypted,
  ] = useState(false);
  const [
    showPasswordDialog,
    setShowPasswordDialog,
  ] = useState(false);
  const [
    isDecrypting,
    setIsDecrypting,
  ] = useState(false);
  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);
  const [
    totalPages,
    setTotalPages,
  ] = useState(1);
  const [
    totalCount,
    setTotalCount,
  ] = useState(0);
  const [
    hasNextPage,
    setHasNextPage,
  ] = useState(false);
  const [
    hasPrevPage,
    setHasPrevPage,
  ] = useState(false);
  const formatDate = (
    date: string
  ) => {
    return new Date(
      date
    ).toLocaleDateString(
      'es-BO',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }
    );
  };
  const fetchCertificates =
    useCallback(
      async () => {
        try {
          setIsLoading(true);
          setError(null);
          const response =
            await certificateService
              .getGeneratedCertificates({
                page:
                  currentPage,
                limit: 10,
                search:
                  searchTerm,
                filter:
                  filterBy as
                    | 'all'
                    | 'recent'
                    | 'high-recipients'
                    | 'with-rank'
                    | 'without-rank',
                sortBy:
                  'date',
                sortOrder:
                  'desc',
                generatedBy:
                  user?.id,
                startDate,
                endDate,
              });
          if (
            response.success &&
            response.data
          ) {
            setCertificates(
              response.data
                .certificates
            );
            setTotalPages(
              response.data
                .pagination
                .totalPages
            );
            setTotalCount(
              response.data
                .pagination
                .totalCount
            );
            setHasNextPage(
              response.data
                .pagination
                .hasNextPage
            );
            setHasPrevPage(
              response.data
                .pagination
                .hasPrevPage
            );
            if (
              response.data
                .requiresDecryption
            ) {
              setIsDecrypted(
                false
              );
              toast.info(
                'Se requiere contraseña',
                {
                  description:
                    'Ingrese su contraseña para consultar los datos detallados de los certificados.',
                }
              );
            } else {
              setIsDecrypted(
                response.data
                  .certificates[0]
                  ?.encrypted ===
                  false
              );
            }
          } else {
            throw new Error(
              response.message ||
                'No se pudieron cargar los certificados'
            );
          }
        } catch (err) {
          console.error(
            'Error al cargar certificados:',
            err
          );
          const errorMessage =
            err instanceof Error
              ? err.message
              : 'Ocurrió un error inesperado';
          setError(
            errorMessage
          );
          toast.error(
            errorMessage
          );
          setCertificates([]);
        } finally {
          setIsLoading(false);
        }
      },
      [
        currentPage,
        searchTerm,
        filterBy,
        startDate,
        endDate,
        user?.id,
      ]
    );
  const fetchDecryptedCertificates =
    useCallback(
      async (
        password: string
      ) => {
        try {
          setIsDecrypting(
            true
          );
          setError(null);
          const response =
            await certificateService
              .getDecryptedGeneratedCertificates({
                password,
                page:
                  currentPage,
                limit: 10,
                search:
                  searchTerm,
                filter:
                  filterBy as
                    | 'all'
                    | 'recent'
                    | 'high-recipients'
                    | 'with-rank'
                    | 'without-rank',
                sortBy:
                  'date',
                sortOrder:
                  'desc',
                generatedBy:
                  user?.id,
                startDate,
                endDate,
              });
          if (
            response.success &&
            response.data
          ) {
            setCertificates(
              response.data
                .certificates
            );
            setTotalPages(
              response.data
                .pagination
                .totalPages
            );
            setTotalCount(
              response.data
                .pagination
                .totalCount
            );
            setHasNextPage(
              response.data
                .pagination
                .hasNextPage
            );
            setHasPrevPage(
              response.data
                .pagination
                .hasPrevPage
            );
            setIsDecrypted(
              true
            );
            const cache =
              EncryptedCache
                .getInstance();
            cache.setPassword(
              password
            );
            toast.success(
              'Datos desbloqueados',
              {
                description:
                  `Se encontraron ${response.data.certificates.length} certificados.`,
              }
            );
          } else {
            throw new Error(
              response.message ||
                'No se pudieron desencriptar los certificados'
            );
          }
        } catch (err) {
          console.error(
            'Error al desencriptar certificados:',
            err
          );
          const errorMessage =
            err instanceof Error
              ? err.message
              : 'No se pudieron desencriptar los datos';
          setError(
            errorMessage
          );
          if (
            errorMessage
              .toLowerCase()
              .includes(
                'password'
              )
          ) {
            toast.error(
              'Contraseña incorrecta',
              {
                description:
                  'Verifique su contraseña e inténtelo nuevamente.',
              }
            );
          } else {
            toast.error(
              errorMessage
            );
          }
          setCertificates([]);
        } finally {
          setIsDecrypting(
            false
          );
          setShowPasswordDialog(
            false
          );
        }
      },
      [
        currentPage,
        searchTerm,
        filterBy,
        startDate,
        endDate,
        user?.id,
      ]
    );
  const handlePasswordConfirm = (
    password: string
  ) => {
    fetchDecryptedCertificates(
      password
    );
  };
  const handleUnlockData = () => {
    setShowPasswordDialog(
      true
    );
  };
  useEffect(() => {
    fetchCertificates();
  }, [
    fetchCertificates,
  ]);
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    filterBy,
    startDate,
    endDate,
  ]);
  const filteredCertificates =
    certificates;
  const filteredRecipients =
    useMemo(
      () => {
        if (
          !selectedCertificate
        ) {
          return [];
        }
        const search =
          recipientSearchTerm
            .toLowerCase();
        return (
          selectedCertificate
            .recipients
            .filter(
              (
                recipient
              ) =>
                recipient.name
                  .toLowerCase()
                  .includes(
                    search
                  ) ||
                (
                  recipient.email &&
                  recipient.email
                    .toLowerCase()
                    .includes(
                      search
                    )
                ) ||
                (
                  recipient.uuid &&
                  recipient.uuid
                    .toLowerCase()
                    .includes(
                      search
                    )
                )
            )
        );
      },
      [
        selectedCertificate,
        recipientSearchTerm,
      ]
    );
  const handleRecipientsClick = (
    certificate:
      CertificateListItem
  ) => {
    setSelectedCertificate(
      certificate
    );
    setRecipientSearchTerm(
      ''
    );
  };
  const closeModal = () => {
    setSelectedCertificate(
      null
    );
    setRecipientSearchTerm(
      ''
    );
  };
  const handleNextPage = () => {
    if (hasNextPage) {
      setCurrentPage(
        (prev) =>
          prev + 1
      );
    }
  };
  const handlePrevPage = () => {
    if (hasPrevPage) {
      setCurrentPage(
        (prev) =>
          prev - 1
      );
    }
  };
  return (
    <ProtectedRoute>
      <div
        className="
          min-h-screen
          bg-[#f6f8fb]
        "
      >
        <Navbar
          variant="certificate"
        />
        <div
          className="
            mx-auto
            max-w-7xl
            px-4
            pb-10
            pt-6
            sm:px-6
            sm:pt-8
          "
        >
          <section
            className="
              relative
              mb-6
              overflow-hidden
              rounded-3xl
              bg-gradient-to-br
              from-[#003874]
              via-[#004b91]
              to-[#00539c]
              px-6
              py-7
              shadow-xl
              shadow-blue-950/10
              sm:px-8
              sm:py-8
            "
          >
            <div
              className="
                absolute
                -right-16
                -top-20
                h-56
                w-56
                rounded-full
                bg-[#ffde32]/15
              "
            />
            <div
              className="
                absolute
                -bottom-24
                right-24
                h-52
                w-52
                rounded-full
                bg-white/5
              "
            />
            <div
              className="
                relative
                z-10
                flex
                flex-col
                gap-5
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <div>
                <div
                  className="
                    mb-3
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    bg-[#ffde32]
                    px-3
                    py-1
                    text-xs
                    font-bold
                    uppercase
                    tracking-wider
                    text-[#003874]
                  "
                >
                  <FileText
                    className="
                      h-3.5
                      w-3.5
                    "
                  />
                  Historial
                </div>
                <h1
                  className="
                    text-2xl
                    font-bold
                    text-white
                    sm:text-3xl
                  "
                >
                  Certificados generados
                </h1>
                <p
                  className="
                    mt-2
                    max-w-2xl
                    text-sm
                    leading-relaxed
                    text-blue-100
                    sm:text-base
                  "
                >
                  Consulte y administre los
                  certificados generados por{' '}
                  <span
                    className="
                      font-semibold
                      text-[#ffde32]
                    "
                  >
                    {user?.organisation}
                  </span>
                </p>
              </div>
              {/* DESBLOQUEAR */}
              {!isDecrypted ? (
                <Button
                  onClick={
                    handleUnlockData
                  }
                  disabled={
                    isLoading
                  }
                  className="
                    h-11
                    shrink-0
                    rounded-xl
                    bg-[#ffde32]
                    px-5
                    font-bold
                    text-[#003874]
                    shadow-md
                    transition-all
                    hover:-translate-y-0.5
                    hover:bg-[#f5d000]
                    hover:text-[#003874]
                  "
                >
                  <Unlock
                    className="
                      mr-2
                      h-4
                      w-4
                    "
                  />
                  Desbloquear datos
                </Button>
              ) : (
                <Badge
                  className="
                    h-10
                    shrink-0
                    border
                    border-[#ffde32]
                    bg-[#ffde32]
                    px-4
                    font-bold
                    text-[#003874]
                    hover:bg-[#ffde32]
                  "
                >
                  <Lock
                    className="
                      mr-2
                      h-4
                      w-4
                    "
                  />
                  Datos desbloqueados
                </Badge>
              )}
            </div>
          </section>
          <Card
            className="
              mb-6
              rounded-2xl
              border
              border-[#003874]/10
              bg-white
              shadow-[0_8px_30px_rgba(0,56,116,0.06)]
            "
          >
            <CardContent
              className="
                p-4
                sm:p-5
              "
            >
              <div
                className="
                  flex
                  flex-col
                  gap-3
                  xl:flex-row
                "
              >
                {/* BUSCADOR */}
                <div
                  className="
                    relative
                    min-w-0
                    flex-1
                  "
                >
                  <Search
                    className="
                      absolute
                      left-3.5
                      top-1/2
                      h-4
                      w-4
                      -translate-y-1/2
                      text-[#003874]
                    "
                  />
                  <Input
                    placeholder="
                      Buscar por certificado, ID generado o destinatario...
                    "
                    value={
                      searchTerm
                    }
                    onChange={(e) =>
                      setSearchTerm(
                        e.target.value
                      )
                    }
                    className="
                      h-11
                      rounded-xl
                      border-gray-200
                      bg-white
                      pl-10
                      focus-visible:ring-[#003874]
                    "
                  />
                </div>
                {/* FILTRO */}
                <div
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >
                  <div
                    className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-[#eef5ff]
                    "
                  >
                    <Filter
                      className="
                        h-4
                        w-4
                        text-[#003874]
                      "
                    />
                  </div>
                  <Select
                    value={
                      filterBy
                    }
                    onValueChange={
                      setFilterBy
                    }
                  >
                    <SelectTrigger
                      className="
                        h-11
                        w-full
                        min-w-[210px]
                        rounded-xl
                        border-gray-200
                        bg-white
                        text-[#003874]
                      "
                    >
                      <SelectValue
                        placeholder="
                          Filtrar certificados
                        "
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        value="all"
                      >
                        Todos los certificados
                      </SelectItem>
                      <SelectItem
                        value="recent"
                      >
                        Últimos 7 días
                      </SelectItem>
                      <SelectItem
                        value="high-recipients"
                      >
                        3 o más destinatarios
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* RANGO FECHAS */}
                <div
                  className="
                    flex
                    flex-wrap
                    items-center
                    gap-2
                  "
                >
                  <Popover>
                    <PopoverTrigger
                      asChild
                    >
                      <Button
                        variant="outline"
                        className="
                          h-11
                          justify-start
                          rounded-xl
                          border-gray-200
                          bg-white
                          text-left
                          font-normal
                          text-[#003874]
                          hover:bg-[#eef5ff]
                          hover:text-[#003874]
                        "
                      >
                        <Calendar
                          className="
                            mr-2
                            h-4
                            w-4
                          "
                        />
                        {startDate &&
                        endDate
                          ? `${startDate} → ${endDate}`
                          : 'Seleccionar fechas'
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="
                        w-auto
                        rounded-2xl
                        border-gray-100
                        p-0
                        shadow-xl
                      "
                    >
                      <DatePickerCalendar
                        mode="range"
                        selected={
                          dateRange
                        }
                        onSelect={(
                          range
                        ) => {
                          setDateRange(
                            range
                          );
                          if (
                            !range?.from &&
                            !range?.to
                          ) {
                            setStartDate(
                              ''
                            );
                            setEndDate(
                              ''
                            );
                            return;
                          }
                          if (
                            range?.from &&
                            range?.to
                          ) {
                            setStartDate(
                              range.from
                                .toISOString()
                                .split(
                                  'T'
                                )[0]
                            );
                            setEndDate(
                              range.to
                                .toISOString()
                                .split(
                                  'T'
                                )[0]
                            );
                          }
                        }}
                        numberOfMonths={
                          2
                        }
                      />
                    </PopoverContent>
                  </Popover>
                  {(startDate ||
                    endDate) && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setDateRange(
                          undefined
                        );
                        setStartDate(
                          ''
                        );
                        setEndDate(
                          ''
                        );
                      }}
                      className="
                        h-11
                        rounded-xl
                        border-red-200
                        bg-white
                        text-red-600
                        hover:bg-red-50
                        hover:text-red-700
                      "
                    >
                      <X
                        className="
                          mr-2
                          h-4
                          w-4
                        "
                      />
                      Limpiar
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          {/* =================================================
              TABLA DE CERTIFICADOS
          ================================================= */}
          <Card
            className="
              overflow-hidden
              rounded-2xl
              border
              border-[#003874]/10
              bg-white
              shadow-[0_8px_30px_rgba(0,56,116,0.07)]
            "
          >
            <CardHeader
              className="
                border-b
                border-[#003874]/10
                bg-[#f8fbff]
                px-5
                py-4
              "
            >
              <CardTitle
                className="
                  flex
                  flex-wrap
                  items-center
                  gap-3
                  text-[#003874]
                "
              >
                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#ffde32]
                  "
                >
                  <FileText
                    className="
                      h-5
                      w-5
                    "
                  />
                </div>
                <div
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >
                  <span>
                    Mis certificados
                  </span>
                  {!isLoading && (
                    <span
                      className="
                        text-sm
                        font-normal
                        text-gray-500
                      "
                    >
                      ({totalCount})
                    </span>
                  )}
                  {isLoading && (
                    <Loader2
                      className="
                        h-4
                        w-4
                        animate-spin
                      "
                    />
                  )}
                </div>
                <Badge
                  variant="outline"
                  className="
                    ml-auto
                    border-[#003874]/10
                    bg-white
                    text-xs
                    font-medium
                    text-[#003874]
                  "
                >
                  {user?.organisation}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent
              className="
                p-0
              "
            >
              {/* ERROR */}
              {error && (
                <div
                  className="
                    m-5
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    border
                    border-red-200
                    bg-red-50
                    p-4
                  "
                >
                  <AlertCircle
                    className="
                      h-5
                      w-5
                      shrink-0
                      text-red-600
                    "
                  />
                  <p
                    className="
                      flex-1
                      text-sm
                      text-red-800
                    "
                  >
                    {error}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={
                      fetchCertificates
                    }
                    className="
                      rounded-lg
                      border-red-200
                      bg-white
                      text-red-600
                      hover:bg-red-100
                    "
                  >
                    Reintentar
                  </Button>
                </div>
              )}
              <div
                className="
                  overflow-x-auto
                "
              >
                <Table>
                  {/* CABECERA */}
                  <TableHeader>
                    <TableRow
                      className="
                        border-gray-100
                        bg-[#f8fbff]
                        hover:bg-[#f8fbff]
                      "
                    >
                      <TableHead
                        className="
                          font-bold
                          text-[#003874]
                        "
                      >
                        N.º
                      </TableHead>
                      <TableHead
                        className="
                          font-bold
                          text-[#003874]
                        "
                      >
                        Fecha
                      </TableHead>
                      <TableHead
                        className="
                          font-bold
                          text-[#003874]
                        "
                      >
                        Evento
                      </TableHead>
                      <TableHead
                        className="
                          font-bold
                          text-[#003874]
                        "
                      >
                        Destinatarios
                      </TableHead>
                      <TableHead
                        className="
                          font-bold
                          text-[#003874]
                        "
                      >
                        Estado de envío
                      </TableHead>
                      <TableHead
                        className="
                          font-bold
                          text-[#003874]
                        "
                      >
                        ID generado
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({
                        length: 5,
                      }).map(
                        (_, i) => (
                          <TableRow
                            key={i}
                            className="
                              border-gray-100
                            "
                          >
                            {Array.from({
                              length: 6,
                            }).map(
                              (
                                __,
                                cell
                              ) => (
                                <TableCell
                                  key={
                                    cell
                                  }
                                >
                                  <div
                                    className="
                                      h-4
                                      animate-pulse
                                      rounded
                                      bg-gray-200
                                    "
                                  />
                                </TableCell>
                              )
                            )}
                          </TableRow>
                        )
                      )
                    ) : (
                      filteredCertificates.map(
                        (
                          certificate
                        ) => (
                          <TableRow
                            key={
                              certificate.id
                            }
                            className="
                              border-gray-100
                              transition-colors
                              hover:bg-[#f8fbff]
                            "
                          >
                            {/* SERIAL */}
                            <TableCell
                              className="
                                font-semibold
                                text-[#003874]
                              "
                            >
                              {
                                certificate.serialNumber
                              }
                            </TableCell>
                            {/* FECHA */}
                            <TableCell
                              className="
                                text-gray-600
                              "
                            >
                              <div
                                className="
                                  flex
                                  items-center
                                  gap-2
                                  whitespace-nowrap
                                "
                              >
                                <Calendar
                                  className="
                                    h-4
                                    w-4
                                    text-[#003874]
                                  "
                                />
                                {formatDate(
                                  certificate.date
                                )}
                              </div>
                            </TableCell>
                            {/* EVENTO */}
                            <TableCell
                              className="
                                font-semibold
                                text-gray-800
                              "
                            >
                              {
                                certificate.certificateId
                              }
                            </TableCell>
                            {/* DESTINATARIOS */}
                            <TableCell>
                              <Button
                                variant="ghost"
                                onClick={() =>
                                  handleRecipientsClick(
                                    certificate
                                  )
                                }
                                className="
                                  h-9
                                  rounded-lg
                                  px-3
                                  text-[#003874]
                                  hover:bg-[#eef5ff]
                                  hover:text-[#003874]
                                "
                              >
                                <Users
                                  className="
                                    mr-2
                                    h-4
                                    w-4
                                  "
                                />
                                {
                                  certificate.noOfRecipient
                                }
                                {' '}
                                destinatarios
                              </Button>
                            </TableCell>
                            {/* ESTADO */}
                            <TableCell>
                              {certificate.deliveryStatus ? (
                                <Badge
                                  variant="outline"
                                  className={`
                                    font-medium
                                    ${
                                      certificate.deliveryStatus ===
                                      'completed'
                                        ? `
                                          border-green-200
                                          bg-green-50
                                          text-green-700
                                        `
                                        : certificate.deliveryStatus ===
                                          'partial'
                                          ? `
                                            border-[#ffde32]
                                            bg-[#fff9d8]
                                            text-[#003874]
                                          `
                                          : certificate.deliveryStatus ===
                                            'failed'
                                            ? `
                                              border-red-200
                                              bg-red-50
                                              text-red-700
                                            `
                                            : `
                                              border-[#003874]/10
                                              bg-[#eef5ff]
                                              text-[#003874]
                                            `
                                    }
                                  `}
                                >
                                  {
                                    certificate.deliveryStatus ===
                                    'pending'
                                      ? 'Enviando...'
                                      : certificate.deliveryStatus ===
                                        'completed'
                                        ? `${certificate.deliveredCount || 0}/${certificate.noOfRecipient} enviados`
                                        : certificate.deliveryStatus ===
                                          'partial'
                                          ? `${certificate.deliveredCount || 0}/${certificate.noOfRecipient} enviados`
                                          : certificate.deliveryStatus ===
                                            'failed'
                                            ? 'Error de envío'
                                            : certificate.deliveryStatus
                                  }
                                </Badge>
                              ) : (
                                <span
                                  className="
                                    text-sm
                                    text-gray-400
                                  "
                                >
                                  No enviado
                                </span>
                              )}
                            </TableCell>
                            {/* ID */}
                            <TableCell>
                              <div
                                className="
                                  flex
                                  items-center
                                  gap-2
                                "
                              >
                                <Hash
                                  className="
                                    h-4
                                    w-4
                                    text-[#003874]
                                  "
                                />
                                <code
                                  className="
                                    rounded-lg
                                    border
                                    border-gray-100
                                    bg-gray-50
                                    px-2.5
                                    py-1.5
                                    text-xs
                                    text-gray-600
                                  "
                                >
                                  {
                                    certificate.generatedId
                                  }
                                </code>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      )
                    )}
                  </TableBody>
                </Table>
                {/* SIN RESULTADOS */}
                {!isLoading &&
                  !error &&
                  filteredCertificates
                    .length === 0 && (
                  <div
                    className="
                      py-16
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
                      <FileText
                        className="
                          h-8
                          w-8
                          text-[#003874]
                        "
                      />
                    </div>
                    <h3
                      className="
                        text-lg
                        font-bold
                        text-[#003874]
                      "
                    >
                      No se encontraron certificados
                    </h3>
                    <p
                      className="
                        mx-auto
                        mt-2
                        max-w-md
                        text-sm
                        leading-relaxed
                        text-gray-400
                      "
                    >
                      Aún no existen certificados
                      generados o los filtros
                      seleccionados no encontraron
                      resultados.
                    </p>
                  </div>
                )}
              </div>
              {!isLoading &&
                !error &&
                totalPages > 1 && (
                <div
                  className="
                    flex
                    flex-col
                    gap-3
                    border-t
                    border-gray-100
                    bg-[#f8fbff]
                    px-5
                    py-4
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                  "
                >
                  <p
                    className="
                      text-sm
                      text-gray-500
                    "
                  >
                    Mostrando{' '}
                    {certificates.length >
                    0
                      ? (
                          currentPage -
                          1
                        ) *
                          10 +
                        1
                      : 0
                    }
                    {' '}a{' '}
                    {Math.min(
                      currentPage *
                        10,
                      totalCount
                    )}
                    {' '}de{' '}
                    {totalCount}
                    {' '}certificados
                  </p>
                  <div
                    className="
                      flex
                      items-center
                      gap-2
                    "
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={
                        handlePrevPage
                      }
                      disabled={
                        !hasPrevPage
                      }
                      className="
                        rounded-xl
                        border-[#003874]/20
                        bg-white
                        text-[#003874]
                        hover:bg-[#eef5ff]
                        hover:text-[#003874]
                      "
                    >
                      <ChevronLeft
                        className="
                          mr-1
                          h-4
                          w-4
                        "
                      />
                      Anterior
                    </Button>
                    <span
                      className="
                        min-w-[110px]
                        text-center
                        text-sm
                        font-medium
                        text-[#003874]
                      "
                    >
                      Página{' '}
                      {currentPage}
                      {' '}de{' '}
                      {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={
                        handleNextPage
                      }
                      disabled={
                        !hasNextPage
                      }
                      className="
                        rounded-xl
                        border-[#003874]/20
                        bg-white
                        text-[#003874]
                        hover:bg-[#eef5ff]
                        hover:text-[#003874]
                      "
                    >
                      Siguiente
                      <ChevronRight
                        className="
                          ml-1
                          h-4
                          w-4
                        "
                      />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <Dialog
          open={
            !!selectedCertificate
          }
          onOpenChange={(
            open
          ) => {
            if (!open) {
              closeModal();
            }
          }}
        >
          <DialogContent
            className="
              max-h-[90vh]
              w-[95vw]
              max-w-4xl
              overflow-hidden
              rounded-3xl
              border
              border-gray-100
              bg-white
              p-0
              shadow-2xl
            "
          >
            {/* CABECERA */}
            <div
              className="
                bg-gradient-to-br
                from-[#003874]
                to-[#00539c]
                px-6
                py-5
              "
            >
              <DialogHeader>
                <DialogTitle
                  className="
                    flex
                    items-center
                    gap-3
                    text-xl
                    font-bold
                    text-white
                  "
                >
                  <div
                    className="
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-xl
                      bg-[#ffde32]
                    "
                  >
                    <Users
                      className="
                        h-5
                        w-5
                        text-[#003874]
                      "
                    />
                  </div>
                  <div>
                    <p>
                      Destinatarios
                    </p>
                    <p
                      className="
                        mt-0.5
                        text-xs
                        font-normal
                        text-blue-100
                      "
                    >
                      {
                        selectedCertificate
                          ?.certificateId
                      }
                    </p>
                  </div>
                </DialogTitle>
              </DialogHeader>
            </div>
            <div
              className="
                space-y-4
                overflow-hidden
                px-6
                pb-6
                pt-5
              "
            >
              {/* BUSCADOR DESTINATARIOS */}
              <div
                className="
                  relative
                "
              >
                <Search
                  className="
                    absolute
                    left-3
                    top-1/2
                    h-4
                    w-4
                    -translate-y-1/2
                    text-[#003874]
                  "
                />
                <Input
                  placeholder="
                    Buscar por nombre, correo o UUID...
                  "
                  value={
                    recipientSearchTerm
                  }
                  onChange={(e) =>
                    setRecipientSearchTerm(
                      e.target.value
                    )
                  }
                  className="
                    h-11
                    rounded-xl
                    border-gray-200
                    bg-white
                    pl-10
                    focus-visible:ring-[#003874]
                  "
                />
              </div>
              {/* TABLA */}
              <div
                className="
                  max-h-96
                  overflow-auto
                  rounded-xl
                  border
                  border-gray-100
                "
              >
                <Table>
                  <TableHeader
                    className="
                      sticky
                      top-0
                      z-10
                    "
                  >
                    <TableRow
                      className="
                        bg-[#f8fbff]
                        hover:bg-[#f8fbff]
                      "
                    >
                      <TableHead
                        className="
                          font-bold
                          text-[#003874]
                        "
                      >
                        Nombre
                      </TableHead>
                      <TableHead
                        className="
                          font-bold
                          text-[#003874]
                        "
                      >
                        Correo electrónico
                      </TableHead>
                      <TableHead
                        className="
                          font-bold
                          text-[#003874]
                        "
                      >
                        UUID
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecipients.map(
                      (
                        recipient,
                        index
                      ) => (
                        <TableRow
                          key={
                            index
                          }
                          className="
                            border-gray-100
                            hover:bg-[#f8fbff]
                          "
                        >
                          <TableCell
                            className="
                              font-semibold
                              text-[#003874]
                            "
                          >
                            {
                              recipient.name
                            }
                          </TableCell>
                          <TableCell
                            className="
                              text-gray-600
                            "
                          >
                            {
                              recipient.email ||
                              'Sin correo'
                            }
                          </TableCell>
                          <TableCell>
                            {recipient.uuid ? (
                              <div
                                className="
                                  flex
                                  flex-wrap
                                  items-center
                                  gap-2
                                "
                              >
                                <code
                                  className="
                                    rounded-lg
                                    border
                                    border-gray-100
                                    bg-gray-50
                                    px-2
                                    py-1
                                    font-mono
                                    text-xs
                                    text-gray-600
                                  "
                                >
                                  {
                                    recipient.uuid
                                  }
                                </code>
                                <Badge
                                  variant="outline"
                                  className="
                                    border-green-200
                                    bg-green-50
                                    text-xs
                                    font-semibold
                                    text-green-700
                                  "
                                >
                                  Verificado
                                </Badge>
                              </div>
                            ) : (
                              <span
                                className="
                                  text-sm
                                  text-gray-400
                                "
                              >
                                Sin UUID
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
                {/* SIN DESTINATARIOS */}
                {isDecrypted ? (
                  filteredRecipients
                    .length === 0 && (
                    <div
                      className="
                        py-10
                        text-center
                      "
                    >
                      <Users
                        className="
                          mx-auto
                          mb-3
                          h-9
                          w-9
                          text-gray-300
                        "
                      />
                      <p
                        className="
                          font-semibold
                          text-[#003874]
                        "
                      >
                        No se encontraron destinatarios
                      </p>
                      <p
                        className="
                          mt-1
                          text-sm
                          text-gray-400
                        "
                      >
                        Intente modificar el término de búsqueda.
                      </p>
                    </div>
                  )
                ) : (
                  <div
                    className="
                      py-10
                      text-center
                    "
                  >
                    <Lock
                      className="
                        mx-auto
                        mb-3
                        h-9
                        w-9
                        text-[#003874]
                      "
                    />
                    <p
                      className="
                        font-semibold
                        text-[#003874]
                      "
                    >
                      Información protegida
                    </p>
                    <p
                      className="
                        mt-1
                        text-sm
                        text-gray-400
                      "
                    >
                      Ingrese su contraseña para
                      visualizar los datos detallados.
                    </p>
                  </div>
                )}
              </div>
              {/* PIE MODAL */}
              <div
                className="
                  flex
                  flex-col
                  gap-3
                  border-t
                  border-gray-100
                  pt-4
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >
                <p
                  className="
                    text-sm
                    text-gray-500
                  "
                >
                  Mostrando{' '}
                  {
                    filteredRecipients
                      .length
                  }
                  {' '}de{' '}
                  {
                    selectedCertificate
                      ?.recipients
                      .length || 0
                  }
                  {' '}destinatarios
                </p>
                <Button
                  onClick={
                    closeModal
                  }
                  className="
                    rounded-xl
                    bg-[#003874]
                    px-6
                    font-semibold
                    text-white
                    hover:bg-[#002b59]
                  "
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <PasswordDialog
          purpose="Decrypt"
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
          title="
            Ingrese su contraseña
          "
          description="
            Ingrese su contraseña de inicio de sesión para desbloquear y visualizar la información detallada de los certificados y sus destinatarios.
          "
          isLoading={
            isDecrypting
          }
        />
      </div>
    </ProtectedRoute>
  );
}