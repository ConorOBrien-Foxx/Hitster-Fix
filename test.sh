curl --request PUT \
  --url https://api.spotify.com/v1/me/player/play \
  --header 'Authorization: Bearer BQD8CiYnNJ16CqmRbvb229Tp__fJTKcQVbDiaF5HmBM7Rv6T7g8EJQ_OU_ro9jkxcArzIoW2Eg6u_J4lbjqqmiKkR0uE5Puq9pyF7s8qZQzXO_jLSptsb69-IlcnZuYGs8MgqrtLN-Mc-KGquf9AhY6VS-xaPwJuvzQwJRFB2snn3MAkdXnud6Pb' \
  --header 'Content-Type: application/json' \
  --data '{
    "context_uri": "spotify:playlist:1iEIBawC4HzKJbFAiRimhz",
    "offset": {
        "position": 0
    },
    "position_ms": 0
}'
