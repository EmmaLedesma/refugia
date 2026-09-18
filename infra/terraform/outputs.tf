output "api_url" {
  description = "URL pública de la API (Elastic Beanstalk)"
  value       = aws_elastic_beanstalk_environment.api.cname
}

output "rds_endpoint" {
  description = "Endpoint de la base de datos RDS"
  value       = aws_db_instance.main.address
}

output "s3_bucket_name" {
  description = "Nombre del bucket S3 de fotos"
  value       = aws_s3_bucket.fotos.bucket
}
