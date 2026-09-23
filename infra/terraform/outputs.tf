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

output "site_url" {
  description = "URL pública HTTPS del sitio completo (frontend + API bajo /api)"
  value       = "https://${aws_cloudfront_distribution.main.domain_name}"
}

output "github_actions_role_arn" {
  description = "ARN del rol que GitHub Actions asume vía OIDC — usar en el secret AWS_DEPLOY_ROLE_ARN del repo"
  value       = aws_iam_role.github_actions.arn
}

output "cloudfront_distribution_id" {
  description = "ID de la distribución CloudFront — usar en el secret CLOUDFRONT_DISTRIBUTION_ID del repo"
  value       = aws_cloudfront_distribution.main.id
}
