{{- define "hirevoice.labels" -}}
app.kubernetes.io/name: hirevoice
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version | replace "+" "_" }}
{{- end }}

{{- define "hirevoice.selectorLabels" -}}
app.kubernetes.io/name: hirevoice
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{- define "hirevoice.backendImage" -}}
{{ .Values.images.backend.repository }}:{{ .Values.images.backend.tag }}
{{- end }}

{{- define "hirevoice.frontendImage" -}}
{{ .Values.images.frontend.repository }}:{{ .Values.images.frontend.tag }}
{{- end }}

{{- define "hirevoice.imagePullSecrets" -}}
{{- with .Values.imagePullSecrets }}
imagePullSecrets:
{{- toYaml . | nindent 2 }}
{{- end }}
{{- end }}

{{- define "hirevoice.backendConfigEnv" -}}
envFrom:
  - configMapRef:
      name: hirevoice-backend-config
{{- end }}

{{- define "hirevoice.rdsEnv" -}}
env:
  - name: DB_USER
    valueFrom:
      secretKeyRef:
        name: {{ .Values.secrets.rdsCredentials.name }}
        key: {{ .Values.secrets.rdsCredentials.userKey }}
  - name: DB_PASSWORD
    valueFrom:
      secretKeyRef:
        name: {{ .Values.secrets.rdsCredentials.name }}
        key: {{ .Values.secrets.rdsCredentials.passwordKey }}
{{- end }}

{{- define "hirevoice.jwtEnv" -}}
- name: JWT_SECRET
  valueFrom:
    secretKeyRef:
      name: {{ .Values.secrets.jwt.name }}
      key: {{ .Values.secrets.jwt.key }}
{{- end }}

{{- define "hirevoice.groqEnv" -}}
- name: GROQ_API_KEY
  valueFrom:
    secretKeyRef:
      name: {{ .Values.secrets.groq.name }}
      key: {{ .Values.secrets.groq.key }}
{{- end }}

{{- define "hirevoice.httpProbes" -}}
readinessProbe:
  httpGet:
    path: /
    port: http
  initialDelaySeconds: {{ .Values.probes.initialDelaySeconds }}
  periodSeconds: {{ .Values.probes.periodSeconds }}
  timeoutSeconds: {{ .Values.probes.timeoutSeconds }}
  failureThreshold: {{ .Values.probes.failureThreshold }}
livenessProbe:
  httpGet:
    path: /
    port: http
  initialDelaySeconds: {{ .Values.probes.initialDelaySeconds }}
  periodSeconds: {{ .Values.probes.periodSeconds }}
  timeoutSeconds: {{ .Values.probes.timeoutSeconds }}
  failureThreshold: {{ .Values.probes.failureThreshold }}
{{- end }}
