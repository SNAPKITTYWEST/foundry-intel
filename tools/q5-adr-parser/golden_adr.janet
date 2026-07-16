# Exact Q(phi) arithmetic where phi^2 = phi + 1.
(defn gcd [a b]
  (var x (math/abs a))
  (var y (math/abs b))
  (while (not= y 0)
    (def t (% x y))
    (set x y)
    (set y t))
  x)

(defn rat [n d]
  (when (= d 0) (error "zero denominator"))
  (def sign (if (< d 0) -1 1))
  (def g (gcd n d))
  @[(/ (* sign n) g) (/ (* sign d) g)])

(defn radd [x y]
  (rat (+ (* (x 0) (y 1)) (* (y 0) (x 1))) (* (x 1) (y 1))))
(defn rmul [x y] (rat (* (x 0) (y 0)) (* (x 1) (y 1))))
(defn rneg [x] (rat (- (x 0)) (x 1)))
(defn q5 [a b] @[a b])
(defn q5-add [x y] @[(radd (x 0) (y 0)) (radd (x 1) (y 1))])
(defn q5-mul [x y]
  (def a (x 0)) (def b (x 1)) (def c (y 0)) (def d (y 1))
  @[(radd (rmul a c) (rmul b d))
    (radd (radd (rmul a d) (rmul b c)) (rmul b d))])
(defn q5-conj [x] @[(radd (x 0) (x 1)) (rneg (x 1))])
(defn rat->string [x] (if (= (x 1) 1) (string (x 0)) (string (x 0) "/" (x 1))))
(defn q5->string [x] (string (rat->string (x 0)) " + " (rat->string (x 1)) "*phi"))

(defn status-of [text]
  (cond
    (string/find "OPEN_CRUX" text) "OPEN_CRUX"
    (string/find "SILENCE_PENDING" text) "SILENCE_PENDING"
    (string/find "PROVEN_NO_SORRY" text) "PROVEN_NO_SORRY"
    (string/find "SPECIFIED" text) "SPECIFIED"
    (string/find "no sorry" text) "PROVEN_NO_SORRY"
    (string/find "crux stays none" text) "OPEN_CRUX"
    "SPECIFIED"))

(defn split-once [s token]
  (def i (string/find token s))
  (if i @[(string/trim (string/slice s 0 i))
          (string/trim (string/slice s (+ i (length token))))]
        @[s ""]))

(defn parse-adr-block [id body]
  (def parts (split-once body "—"))
  @{:id id :title (parts 0) :description (parts 1) :status (status-of body)})

(defn parse-registry [path]
  (def lines (string/split "\n" (slurp path)))
  (def records @[]) (var current nil) (var body @[])
  (each raw lines
    (def line (string/trim raw))
    (cond
      (= line "") nil
      (string/has-prefix? "ADR-" line)
      (do
        (when current (array/push records (parse-adr-block current (string/join body " "))))
        (set current line) (set body @[]))
      (array/push body line)))
  (when current (array/push records (parse-adr-block current (string/join body " "))))
  records)

(defn adr-weight [record]
  (match (record :status)
    "PROVEN_NO_SORRY" (q5 (rat 1 1) (rat 1 1))
    "SILENCE_PENDING" (q5 (rat 0 1) (rat 1 1))
    "OPEN_CRUX" (q5 (rat -1 1) (rat 1 1))
    (q5 (rat 1 1) (rat 0 1))))

(defn summarize [records]
  (var total (q5 (rat 0 1) (rat 0 1)))
  (each record records (set total (q5-add total (adr-weight record))))
  @{:count (length records) :q5_total (q5->string total) :records records})

(defn json-escape [s]
  (-> s (string/replace "\\" "\\\\") (string/replace "\"" "\\\"") (string/replace "\n" "\\n")))
(defn emit-json [value]
  (cond
    (nil? value) "null"
    (boolean? value) (if value "true" "false")
    (number? value) (string value)
    (string? value) (string "\"" (json-escape value) "\"")
    (array? value) (string "[" (string/join (map emit-json value) ",") "]")
    (table? value)
    (do (def items @[])
        (eachp k v value (array/push items (string "\"" (json-escape (string k)) "\":" (emit-json v))))
        (string "{" (string/join items ",") "}"))
    (error "unsupported JSON value")))

(defn main [& args]
  (when (< (length args) 2)
    (print "usage: janet golden_adr.janet ADR_REGISTRY.txt [output.json]")
    (os/exit 2))
  (def records (parse-registry (args 1)))
  (def payload (summarize records))
  (def out (if (> (length args) 2) (args 2) "adr_manifest.json"))
  (spit out (emit-json payload))
  (print "parsed " (length records) " ADR records")
  (print "Q(phi) total: " (payload :q5_total))
  (print "wrote " out))

(main ;args)
